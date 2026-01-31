from datetime import datetime
from zoneinfo import ZoneInfo

# 台灣時區
TW_TZ = ZoneInfo('Asia/Taipei')

# 所有 template 的開始和結束時間
START_DATE = datetime(2026, 1, 1, 0, 0, 0, tzinfo=TW_TZ)
END_DATE = datetime(2027, 1, 1, 23, 59, 59, tzinfo=TW_TZ)

TEMPLATES = [
    # Teacher A Templates
    {
        'created_by': 'teacher_1',
        'name': 'Fight Against Hunger',
        'issue_topic': 'Why the world has failed in the fight against hunger?',
        'article_content': """
            Nine years ago, the UN established 17 Sustainable Development Goals (SDGs), which included ending poverty and hunger. Yet last year, nearly 750 million people faced hunger — an increase of around 152 million compared to 2019.
            The G20 Leaders’ Summit in November marked the launch of the Global Alliance Against Hunger and Poverty, an initiative aiming to eradicate hunger and poverty by 2030, aligning with the SDGs.
            The Alliance’s early commitments, referred to as “2030 Sprints,” include reaching 500 million people with cash transfer programs and expanding nutritious school meals to 150 million children.
            At the Doha Forum, in Qatar, an annual meeting of global policy leaders, a senior representative of the program, Brazil’s Minister of Social Development and Assistance, Wellington Dias, spoke to CNN about the importance of tackling hunger and poverty, and the status of the Alliance since its announcement.
            CNN: Why was there a need to launch the Global Alliance Against Hunger and Poverty?
            Wellington Dias: In 2015, the world reached an agreement approved at the UN General Assembly for the Sustainable Development Goals for 2030. Part of this was a commitment by the global community to eliminate poverty and achieve zero hunger by 2030.
            The world has failed. Poverty, misery, and hunger have increased.
            These issues have a larger impact than we think. Consider the migration crises or the root causes of conflicts — poverty and hunger are many times central to that. Even threats to democracies are tied to these issues.
            The wealthier nations must help developing countries with a basket of proven effective projects. These include a national plan backed by knowledge and financial support. Developing countries must make their own plans and act on them, while developed nations must offer assistance. This initiative was approved in Rio de Janeiro (at the G20 Summit), and now we face the challenge of implementation.
            CNN: What is the current status of implementation?
            WD: We are working through global blocs, such as the World Bank in Washington and the UN in New York, and with entities like UNDP (UN Development Programme) and FAO (UN Food and Agriculture Organization). Currently, 86 countries and 66 organizations are part of this alliance, with hubs in Europe (Rome at the FAO headquarters), South America (Brasilia), Africa (Addis Ababa), and Asia (Bangkok). The Gulf region and the Arab League are also under consideration.
            The objective is to work with each country’s national plan, tailored to their needs. Maybe with a focus on income transfers, school feeding programs, local agriculture, professional training, and social integration, etc. Those countries capable of helping poorer countries will do so according to these plans.
            CNN: Why do you think hunger and poverty have not been effectively addressed earlier?
            WD: Hunger and poverty are topics that are often avoided. Especially by those who are impacted by it. Many countries facing poverty and hunger feel uncomfortable discussing this.
            I greatly value events like the Doha Forum for addressing this issue. We need more open debate and experience-sharing among countries like Colombia, Brazil, and Mali, alongside UN organizations like the World Food Programme.
            Hunger is a responsibility for all nations and citizens. In the past, hunger was tied to food scarcity. Today, in the 21st century, the world produces more than enough food for everyone. This means that countries joining together, by fighting food waste and engaging with the Global Alliance Against Hunger and Poverty, I think we can create a better world by 2030.
        """,
        'start_date': START_DATE,
        'end_date': END_DATE,
    },
    {
        'created_by': 'teacher_1',
        'name': 'Artificial intelligence and the job market',
        'issue_topic': 'Will the development of artificial intelligence lead to large-scale unemployment?',
        'article_content': 'The rise of generative AI is reshaping work patterns across industries. On one hand, AI can automate repetitive tasks, increase productivity, and create new job demands, such as prompting engineers. On the other hand, many white-collar workers worry that their jobs will be replaced by AI, leading to structural unemployment. Experts suggest that future education should focus on cultivating skills that AI cannot easily imitate, such as critical thinking, creativity, and interpersonal communication skills, to adapt to the new era of human-machine collaboration.',
        'start_date': START_DATE,
        'end_date': END_DATE,
    },
]
