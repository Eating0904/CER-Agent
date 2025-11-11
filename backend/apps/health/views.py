import logging

from django.db import OperationalError, connections
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
        db_status = 'ok'
        try:
            for alias in connections:
                connections[alias].cursor().execute('SELECT 1')
        except OperationalError as e:
            logger.error(f'Database connection error: {e}')
            db_status = 'error'
            overall_status = False
        checks['database'] = db_status

        if overall_status:
            return Response({'status': 'ok', 'dependencies': checks}, status=200)
        else:
            return Response({'status': 'error', 'dependencies': checks}, status=503)
