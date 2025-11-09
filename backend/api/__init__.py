"""API package for WorkSchedule backend."""

__all__ = [
    "register_api",
]


def register_api(app):
    from .absences import bp as absences_bp
    from .employees import bp as employees_bp
    from .imports import bp as imports_bp
    from .reporting import bp as reporting_bp
    from .roles import bp as roles_bp
    from .schedules import bp as schedules_bp
    from .shifts import bp as shifts_bp

    app.register_blueprint(absences_bp, url_prefix="/api")
    app.register_blueprint(employees_bp, url_prefix="/api")
    app.register_blueprint(imports_bp, url_prefix="/api")
    app.register_blueprint(roles_bp, url_prefix="/api")
    app.register_blueprint(reporting_bp, url_prefix="/api")
    app.register_blueprint(schedules_bp, url_prefix="/api")
    app.register_blueprint(shifts_bp, url_prefix="/api")
