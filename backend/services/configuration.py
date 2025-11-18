"""
Configuration loader service.

This module provides centralized access to generator configuration including
labor law rules, holidays, staffing requirements, and generator parameters.
"""

from __future__ import annotations

from datetime import date
from typing import Any, Dict, List, Optional, cast

from sqlalchemy import or_
from sqlalchemy.orm import Session

from ..models import (
    LaborLawRule,
    Holiday,
    StaffingRequirementTemplate,
    GeneratorParameter,
    Pracownik,
)


class ConfigurationLoader:
    def create_or_update_holiday_api(self, data: dict) -> Holiday:
        """
        Create or update a holiday from API payload.
        """
        from datetime import date
        target_date = date.fromisoformat(data["date"])
        name = data.get("name", "")
        coverage_overrides = data.get("coverage_overrides")
        store_closed = data.get("store_closed", False)
        return self.create_or_update_holiday(
            target_date=target_date,
            name=name,
            coverage_overrides=coverage_overrides,
            store_closed=store_closed,
        )

    def create_or_update_staffing_template_api(self, data: dict) -> StaffingRequirementTemplate:
        """
        Create or update a staffing template from API payload.
        """
        from datetime import date
        day_type = data["day_type"]
        shift_id = data["shift_id"]
        role_id = data["role_id"]
        min_staff = data["min_staff"]
        target_staff = data["target_staff"]
        max_staff = data.get("max_staff")
        effective_from = date.fromisoformat(data["effective_from"]) if data.get("effective_from") else None
        effective_to = date.fromisoformat(data["effective_to"]) if data.get("effective_to") else None
        return self.create_or_update_staffing_template(
            day_type=day_type,
            shift_id=shift_id,
            role_id=role_id,
            min_staff=min_staff,
            target_staff=target_staff,
            max_staff=max_staff,
            effective_from=effective_from,
            effective_to=effective_to,
        )

    def create_or_update_generator_parameters_api(self, data: dict) -> GeneratorParameter:
        """
        Create or update generator parameters from API payload.
        """
        scenario_type = data["scenario_type"]
        weights = data["weights"]
        max_consecutive_nights = data.get("max_consecutive_nights")
        min_rest_hours_override = data.get("min_rest_hours_override")
        last_updated_by = data.get("last_updated_by")
        return self.create_or_update_generator_parameters(
            scenario_type=scenario_type,
            weights=weights,
            max_consecutive_nights=max_consecutive_nights,
            min_rest_hours_override=min_rest_hours_override,
            last_updated_by=last_updated_by,
        )
    """
    Centralized configuration loader for schedule generation.
    
    Provides access to all configuration data needed by generators and validators.
    """
    
    def __init__(self, session: Session):
        """
        Initialize configuration loader.
        
        Args:
            session: Database session
        """
        self.session = session
    
    def get_active_rules(
        self,
        month_start: date,
        month_end: date,
        category: Optional[str] = None,
        severity: Optional[str] = None,
    ) -> List[LaborLawRule]:
        """
        Get active labor law rules for the given period.
        
        Args:
            month_start: Start of the period
            month_end: End of the period
            category: Filter by category (REST, HOURS_LIMIT, etc.)
            severity: Filter by severity (HARD, SOFT)
            
        Returns:
            List of active labor law rules
        """
        query = self.session.query(LaborLawRule).filter(
            or_(
                LaborLawRule.active_from.is_(None),
                LaborLawRule.active_from <= month_end,
            ),
            or_(
                LaborLawRule.active_to.is_(None),
                LaborLawRule.active_to >= month_start,
            ),
        )
        
        if category:
            query = query.filter(LaborLawRule.category == category)
        
        if severity:
            query = query.filter(LaborLawRule.severity == severity)
        
        return query.all()
    
    def get_rule_by_code(self, code: str) -> Optional[LaborLawRule]:
        """
        Get a specific labor law rule by its code.
        
        Args:
            code: Rule code (e.g., 'odpoczynek_dobowy')
            
        Returns:
            Labor law rule or None if not found
        """
        return (
            self.session.query(LaborLawRule)
            .filter(LaborLawRule.code == code)
            .first()
        )
    
    def get_holidays(
        self,
        month_start: date,
        month_end: date,
    ) -> List[Holiday]:
        """
        Get holidays for the given period.
        
        Args:
            month_start: Start of the period
            month_end: End of the period
            
        Returns:
            List of holidays
        """
        return (
            self.session.query(Holiday)
            .filter(
                Holiday.date >= month_start,
                Holiday.date <= month_end
            )
            .order_by(Holiday.date)
            .all()
        )
    
    def get_holiday_by_date(self, target_date: date) -> Optional[Holiday]:
        """
        Get holiday for a specific date.
        
        Args:
            target_date: Date to check
            
        Returns:
            Holiday or None if not a holiday
        """
        return (
            self.session.query(Holiday)
            .filter(Holiday.date == target_date)
            .first()
        )
    
    def get_staffing_templates(
        self,
        day_type: Optional[str] = None,
        shift_id: Optional[int] = None,
        role_id: Optional[int] = None,
        effective_date: Optional[date] = None,
    ) -> List[StaffingRequirementTemplate]:
        """
        Get staffing requirement templates.
        
        Args:
            day_type: Filter by day type (WEEKDAY, WEEKEND, HOLIDAY)
            shift_id: Filter by shift ID
            role_id: Filter by role ID
            effective_date: Get templates effective on this date
            
        Returns:
            List of staffing requirement templates
        """
        query = self.session.query(StaffingRequirementTemplate)
        
        if day_type:
            query = query.filter(StaffingRequirementTemplate.day_type == day_type)
        
        if shift_id is not None:
            query = query.filter(StaffingRequirementTemplate.shift_id == shift_id)
        
        if role_id is not None:
            query = query.filter(StaffingRequirementTemplate.role_id == role_id)
        
        if effective_date is not None:
            query = query.filter(
                or_(
                    StaffingRequirementTemplate.effective_from.is_(None),
                    StaffingRequirementTemplate.effective_from <= effective_date,
                ),
                or_(
                    StaffingRequirementTemplate.effective_to.is_(None),
                    StaffingRequirementTemplate.effective_to >= effective_date,
                ),
            )
        
        return query.all()
    
    def get_generator_parameters(
        self,
        scenario_type: str = "DEFAULT",
    ) -> Optional[GeneratorParameter]:
        """
        Get generator parameters for a scenario type.
        
        Args:
            scenario_type: Scenario type (DEFAULT, NIGHT_FOCUS, PEAK_SEASON, etc.)
            
        Returns:
            Generator parameters or None if not found
        """
        params = (
            self.session.query(GeneratorParameter)
            .filter(GeneratorParameter.scenario_type == scenario_type)
            .first()
        )
        
        # Fallback to DEFAULT if scenario not found
        if not params and scenario_type != "DEFAULT":
            params = (
                self.session.query(GeneratorParameter)
                .filter(GeneratorParameter.scenario_type == "DEFAULT")
                .first()
            )
        
        return params
    
    def get_employee_preferences(
        self,
        employee_id: int,
    ) -> Dict[str, Any]:
        """
        Get employee preferences.
        
        Args:
            employee_id: Employee ID
            
        Returns:
            Dictionary of preferences (from preferencje JSON field)
        """
        employee = self.session.get(Pracownik, employee_id)
        if isinstance(employee, Pracownik):
            raw_preferences = cast(Optional[Dict[str, Any]], getattr(employee, "preferencje", None))
            if raw_preferences is not None:
                return raw_preferences
        return {}
    
    def get_all_employee_preferences(self) -> Dict[int, Dict[str, Any]]:
        """
        Get preferences for all employees.
        
        Returns:
            Dictionary mapping employee_id to preferences
        """
        employees = self.session.query(Pracownik).all()
        preferences: Dict[int, Dict[str, Any]] = {}
        for emp in employees:
            if not isinstance(emp, Pracownik):
                continue
            raw_preferences = cast(Optional[Dict[str, Any]], getattr(emp, "preferencje", None))
            if raw_preferences is not None:
                preferences[cast(int, getattr(emp, "id"))] = raw_preferences
        return preferences
    
    def create_or_update_holiday(
        self,
        target_date: date,
        name: str,
        coverage_overrides: Optional[Dict[str, Any]] = None,
        store_closed: bool = False,
    ) -> Holiday:
        """
        Create or update a holiday.
        
        Args:
            target_date: Date of the holiday
            name: Holiday name
            coverage_overrides: Coverage overrides for this holiday
            store_closed: Whether the store is closed
            
        Returns:
            Created or updated Holiday
        """
        holiday = self.get_holiday_by_date(target_date)
        
        if holiday is not None:
            updates = {
                "name": name,
                "coverage_overrides": coverage_overrides,
                "store_closed": store_closed,
            }
            for field, value in updates.items():
                setattr(holiday, field, value)
        else:
            holiday = Holiday(
                date=target_date,
                name=name,
                coverage_overrides=coverage_overrides,
                store_closed=store_closed,
            )
            self.session.add(holiday)
        
        self.session.flush()
        return holiday
    
    def create_or_update_staffing_template(
        self,
        day_type: str,
        shift_id: int,
        role_id: int,
        min_staff: int,
        target_staff: int,
        max_staff: Optional[int] = None,
        effective_from: Optional[date] = None,
        effective_to: Optional[date] = None,
    ) -> StaffingRequirementTemplate:
        """
        Create or update a staffing requirement template.
        
        Args:
            day_type: Day type (WEEKDAY, WEEKEND, HOLIDAY)
            shift_id: Shift ID
            role_id: Role ID
            min_staff: Minimum staff count
            target_staff: Target staff count
            max_staff: Maximum staff count
            effective_from: Effective from date
            effective_to: Effective to date
            
        Returns:
            Created or updated StaffingRequirementTemplate
        """
        # Check for existing template
        existing = (
            self.session.query(StaffingRequirementTemplate)
            .filter(
                StaffingRequirementTemplate.day_type == day_type,
                StaffingRequirementTemplate.shift_id == shift_id,
                StaffingRequirementTemplate.role_id == role_id,
            )
            .first()
        )
        
        if existing is not None:
            updates = {
                "min_staff": min_staff,
                "target_staff": target_staff,
                "max_staff": max_staff,
                "effective_from": effective_from,
                "effective_to": effective_to,
            }
            for field, value in updates.items():
                setattr(existing, field, value)
            template = existing
        else:
            template = StaffingRequirementTemplate(
                day_type=day_type,
                shift_id=shift_id,
                role_id=role_id,
                min_staff=min_staff,
                target_staff=target_staff,
                max_staff=max_staff,
                effective_from=effective_from,
                effective_to=effective_to,
            )
            self.session.add(template)
        
        self.session.flush()
        return template
    
    def create_or_update_generator_parameters(
        self,
        scenario_type: str,
        weights: Dict[str, Any],
        max_consecutive_nights: Optional[int] = None,
        min_rest_hours_override: Optional[int] = None,
        last_updated_by: Optional[str] = None,
    ) -> GeneratorParameter:
        """
        Create or update generator parameters.
        
        Args:
            scenario_type: Scenario type (DEFAULT, NIGHT_FOCUS, PEAK_SEASON, etc.)
            weights: Dictionary of optimization weights
            max_consecutive_nights: Maximum consecutive night shifts
            min_rest_hours_override: Override for minimum rest hours
            last_updated_by: User who last updated the parameters
            
        Returns:
            Created or updated GeneratorParameter
        """
        params = self.get_generator_parameters(scenario_type)
        
        if params is not None:
            updates = {
                "weights": weights,
                "max_consecutive_nights": max_consecutive_nights,
                "min_rest_hours_override": min_rest_hours_override,
                "last_updated_by": last_updated_by,
            }
            for field, value in updates.items():
                setattr(params, field, value)
        else:
            params = GeneratorParameter(
                scenario_type=scenario_type,
                weights=weights,
                max_consecutive_nights=max_consecutive_nights,
                min_rest_hours_override=min_rest_hours_override,
                last_updated_by=last_updated_by,
            )
            self.session.add(params)
        
        self.session.flush()
        return params
