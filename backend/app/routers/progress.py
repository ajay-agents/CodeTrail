from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..deps import get_current_user

router = APIRouter(prefix="/progress", tags=["progress"])


def _get_or_create(db: Session, user: models.User) -> models.Progress:
    progress = db.query(models.Progress).filter(models.Progress.user_id == user.id).first()
    if progress is None:
        progress = models.Progress(
            user_id=user.id,
            data={"xp": 0, "streak": 1, "lastDay": "", "ch": {}, "badges": {}, "last": None, "daily": None},
        )
        db.add(progress)
        db.commit()
        db.refresh(progress)
    return progress


@router.get("", response_model=schemas.ProgressResponse)
def get_progress(db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    progress = _get_or_create(db, user)
    return schemas.ProgressResponse(
        data=progress.data,
        updated_at=progress.updated_at.isoformat() if progress.updated_at else None,
    )


@router.put("", response_model=schemas.ProgressResponse)
def put_progress(
    payload: schemas.ProgressUpdateRequest,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    progress = _get_or_create(db, user)
    progress.data = payload.data
    db.add(progress)
    db.commit()
    db.refresh(progress)
    return schemas.ProgressResponse(
        data=progress.data,
        updated_at=progress.updated_at.isoformat() if progress.updated_at else None,
    )
