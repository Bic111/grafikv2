export type DayType = "WEEKDAY" | "WEEKEND" | "HOLIDAY";

export interface StaffingTemplate {
  id: number;
  day_type: DayType;
  shift_id: number;
  role_id: number;
  min_staff: number;
  target_staff: number;
  max_staff: number | null;
  utworzono?: string;
  zaktualizowano?: string;
}

export interface StaffingTemplateFormState {
  day_type: DayType | "";
  shift_id: string; // string, bo z inputa
  role_id: string; // string, bo z inputa
  min_staff: string; // string, bo z inputa
  target_staff: string; // string, bo z inputa
  max_staff: string; // string, bo z inputa
}

export type CreateStaffingTemplateInput = Omit<StaffingTemplate, 'id' | 'utworzono' | 'zaktualizowano'>;
export type UpdateStaffingTemplateInput = Partial<CreateStaffingTemplateInput>;