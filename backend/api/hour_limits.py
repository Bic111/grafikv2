from flask import Blueprint, request, jsonify, abort

from ..database import session_scope
from ..models import HourLimit

bp = Blueprint('hour_limits', __name__)


def limit_to_dict(h: HourLimit) -> dict:
    return {
        'id': str(h.id),
        'etat': h.etat,
        'max_dziennie': h.max_dziennie,
        'max_tygodniowo': h.max_tygodniowo,
        'max_miesiecznie': h.max_miesiecznie,
        'max_kwartalnie': h.max_kwartalnie,
    }


@bp.get('/hour-limits')
def get_limits():
    etat = request.args.get('etat')
    with session_scope() as session:
        q = session.query(HourLimit)
        if etat is not None:
            try:
                etat_val = float(etat)
            except ValueError:
                return jsonify({'error': 'invalid etat'}), 400
            h = q.filter(HourLimit.etat == etat_val).first()
            if not h:
                abort(404)
            return jsonify(limit_to_dict(h))
        items = q.order_by(HourLimit.etat.asc()).all()
        return jsonify([limit_to_dict(h) for h in items])


@bp.get('/hour-limits/<int:limit_id>')
def get_limit(limit_id: int):
    with session_scope() as session:
        h = session.query(HourLimit).get(limit_id)
        if not h:
            abort(404)
        return jsonify(limit_to_dict(h))


def _extract_limit_payload(data: dict) -> dict:
    # Accept both monthly keys
    monthly = data.get('max_miesiecznie')
    if monthly is None:
        monthly = data.get('max_miesięcznie')
    etat_value = data.get('etat')
    if etat_value is None:
        raise ValueError("etat is required")
    payload = {
        'etat': float(etat_value),
        'max_dziennie': data.get('max_dziennie'),
        'max_tygodniowo': data.get('max_tygodniowo'),
        'max_miesiecznie': monthly,
        'max_kwartalnie': data.get('max_kwartalnie'),
    }
    return payload


@bp.post('/hour-limits')
def create_limit():
    data = request.get_json(silent=True) or {}
    if 'etat' not in data:
        return jsonify({'error': 'etat is required'}), 400
    payload = _extract_limit_payload(data)

    with session_scope() as session:
        # ensure unique per etat if desired (not enforced strictly)
        existing = session.query(HourLimit).filter(HourLimit.etat == payload['etat']).first()
        if existing:
            return jsonify({'error': 'hour limit for this etat already exists'}), 409
        h = HourLimit(**payload)
        session.add(h)
        session.flush()
        return jsonify(limit_to_dict(h)), 201


@bp.put('/hour-limits/<int:limit_id>')
def update_limit(limit_id: int):
    data = request.get_json(silent=True) or {}
    with session_scope() as session:
        h = session.query(HourLimit).get(limit_id)
        if not h:
            abort(404)
        if 'etat' in data:
            etat_value = data.get('etat')
            if etat_value is not None:
                h.etat = float(etat_value)
        if 'max_dziennie' in data:
            h.max_dziennie = data.get('max_dziennie')
        if 'max_tygodniowo' in data:
            h.max_tygodniowo = data.get('max_tygodniowo')
        if 'max_miesiecznie' in data or 'max_miesięcznie' in data:
            monthly = data.get('max_miesiecznie')
            if monthly is None:
                monthly = data.get('max_miesięcznie')
            h.max_miesiecznie = monthly
        if 'max_kwartalnie' in data:
            h.max_kwartalnie = data.get('max_kwartalnie')
        session.add(h)
        return jsonify(limit_to_dict(h))


@bp.delete('/hour-limits/<int:limit_id>')
def delete_limit(limit_id: int):
    with session_scope() as session:
        h = session.query(HourLimit).get(limit_id)
        if not h:
            abort(404)
        session.delete(h)
        return '', 204
