import logging

from django.db import OperationalError, connections
from langchain_core.messages import HumanMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from langfuse import Langfuse
from langfuse.langchain import CallbackHandler
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet

logger = logging.getLogger('default')


class HealthViewSet(ViewSet):
    permission_classes = [AllowAny]

    @action(detail=False, methods=['get'])
    def live(self, request):
        return Response({'status': 'ok'}, status=200)

    @action(detail=False, methods=['get'])
    def ready(self, request):
        checks = {}
        overall_status = True

        # Check database
        db_status = 'ok'
        try:
            for alias in connections:
                connections[alias].cursor().execute('SELECT 1')
        except OperationalError as e:
            logger.error(f'Database connection error: {e}')
            db_status = 'error'
            overall_status = False
        checks['database'] = db_status

        # Check Langfuse
        langfuse_status = 'ok'
        try:
            langfuse = Langfuse()
            langfuse.auth_check()
        except Exception as e:
            logger.error(f'Langfuse connection error: {e}')
            langfuse_status = 'error'
            overall_status = False
        checks['langfuse'] = langfuse_status

        if overall_status:
            return Response({'status': 'ok', 'dependencies': checks}, status=200)
        else:
            return Response({'status': 'error', 'dependencies': checks}, status=503)

    @action(detail=False, methods=['get'])
    def llm(self, request):
        # Check LLM
        llm_status = 'ok'
        trace_id = None
        llm_response = None

        try:
            langfuse = Langfuse()
            llm = ChatGoogleGenerativeAI(model='gemini-3-flash-preview', temperature=0)

            with langfuse.start_as_current_observation(
                name='health_check', as_type='trace', metadata={'type': 'health'}
            ) as trace:
                langfuse_handler = CallbackHandler()
                message = HumanMessage(content='Health Check. Reply with only "OK".')
                trace.update(input='Health Check. Reply with only "OK".')
                llm_response = llm.invoke([message], config={'callbacks': [langfuse_handler]})
                trace.update(output=llm_response.content)
                trace_id = trace.trace_id

            if not trace_id:
                logger.error('LLM health check: Failed to get trace_id')
                llm_status = 'error'

        except Exception as e:
            logger.error(f'LLM health check error: {e}')
            llm_status = 'error'

        if llm_status == 'ok':
            return Response(
                {
                    'status': 'ok',
                    'trace_id': trace_id,
                    'response': llm_response.content,
                },
                status=200,
            )
        else:
            return Response({'status': 'error'}, status=503)
