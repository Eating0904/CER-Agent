from datetime import datetime

from pydantic import BaseModel, Field


class UserActionRecord(BaseModel):
    """映射 backend UserAction Django model (db_table='user_action')"""

    id: int
    user_id: int
    action_type: str
    timestamp: datetime
    map_id: int | None = None
    essay_id: int | None = None
    metadata: dict = Field(default_factory=dict)
