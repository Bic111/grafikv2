from flask import Blueprint, request, jsonify, abort
from datetime import datetime

from ..database import session_scope
from ..models import Rule

bp = Blueprint('rules', __name__)


def rule_to_dict(r: Rule) -> dict:
    return {
        'id': str(r.id),
        'nazwa': r.nazwa,
        'opis': r.opis,
        'typ': r.typ,
        'aktywna': bool(r.aktywna) if r.aktywna is not None else None,
        'utworzono': r.utworzono.isoformat() if r.utworzono is not None else None,
        'zaktualizowano': r.zaktualizowano.isoformat() if r.zaktualizowano is not None else None,
    }


@bp.get('/rules')
def get_rules():
    typ = request.args.get('typ')
    aktywna = request.args.get('aktywna')

    with session_scope() as session:
        q = session.query(Rule)
        if typ:
            q = q.filter(Rule.typ == typ)
        if aktywna is not None:
            if aktywna.lower() in ('1', 'true', 'yes'):  # treat truthy
                q = q.filter(Rule.aktywna.is_(True))
            elif aktywna.lower() in ('0', 'false', 'no'):
                q = q.filter(Rule.aktywna.is_(False))
        items = q.order_by(Rule.nazwa.asc()).all()
        return jsonify([rule_to_dict(r) for r in items])


@bp.get('/rules/<int:rule_id>')
def get_rule(rule_id: int):
    with session_scope() as session:
        r = session.query(Rule).get(rule_id)
        if not r:
            abort(404)
        return jsonify(rule_to_dict(r))


@bp.post('/rules')
def create_rule():
    data = request.get_json(silent=True) or {}
    nazwa = (data.get('nazwa') or '').strip()
    if not nazwa:
        return jsonify({'error': 'nazwa is required'}), 400

    r = Rule(
        nazwa=nazwa,
        opis=(data.get('opis') or None),
        typ=(data.get('typ') or None),
        aktywna=bool(data.get('aktywna')) if data.get('aktywna') is not None else True,
        utworzono=datetime.utcnow(),
        zaktualizowano=datetime.utcnow(),
    )
    with session_scope() as session:
        session.add(r)
        session.flush()  # to populate id
        return jsonify(rule_to_dict(r)), 201


@bp.put('/rules/<int:rule_id>')
def update_rule(rule_id: int):
    data = request.get_json(silent=True) or {}
    with session_scope() as session:
        r = session.query(Rule).get(rule_id)
        if not r:
            abort(404)

        if 'nazwa' in data:
            v = (data.get('nazwa') or '').strip()
            if not v:
                return jsonify({'error': 'nazwa cannot be empty'}), 400
            r.nazwa = v
        if 'opis' in data:
            v = (data.get('opis') or '').strip()
            r.opis = v or None
        if 'typ' in data:
            v = (data.get('typ') or '').strip()
            r.typ = v or None
        if 'aktywna' in data:
            r.aktywna = bool(data.get('aktywna'))

        r.zaktualizowano = datetime.utcnow()
        session.add(r)
        return jsonify(rule_to_dict(r))


@bp.delete('/rules/<int:rule_id>')
def delete_rule(rule_id: int):
    with session_scope() as session:
        r = session.query(Rule).get(rule_id)
        if not r:
            abort(404)
        session.delete(r)
        return '', 204
