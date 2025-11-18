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
    from .shift_parameters import bp as shift_parameters_bp
    from .validation import bp as validation_bp
    from .holidays import bp as holidays_bp
    from .staffing_requirements import bp as staffing_bp
    from .rules import bp as rules_bp
    from .hour_limits import bp as hour_limits_bp

    app.register_blueprint(absences_bp, url_prefix="/api")
    app.register_blueprint(employees_bp, url_prefix="/api")
    app.register_blueprint(imports_bp, url_prefix="/api")
    app.register_blueprint(roles_bp, url_prefix="/api")
    app.register_blueprint(reporting_bp, url_prefix="/api")
    app.register_blueprint(schedules_bp, url_prefix="/api")
    app.register_blueprint(shifts_bp, url_prefix="/api")
    app.register_blueprint(shift_parameters_bp, url_prefix="/api")
    app.register_blueprint(validation_bp, url_prefix="/api")
    app.register_blueprint(holidays_bp, url_prefix="/api")
    app.register_blueprint(staffing_bp, url_prefix="/api")
    app.register_blueprint(rules_bp, url_prefix="/api")
    app.register_blueprint(hour_limits_bp, url_prefix="/api")
