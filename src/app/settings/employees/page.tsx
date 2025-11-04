'use client';

import { useState } from 'react';
import { useTauriQuery, useTauriMutation } from '@/lib/hooks/useTauri';
import { getEmployees, addEmployee, updateEmployee } from '@/lib/db';
import type { Employee } from '@/lib/types';

export default function EmployeesPage() {
  const [isAddingEmployee, setIsAddingEmployee] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Fetch employees
  const { data: employees, error, isLoading, refetch } = useTauriQuery(getEmployees);

  // Add employee mutation
  const { mutate: createEmployee, isLoading: isCreating } = useTauriMutation(addEmployee);

  // Update employee mutation
  const { mutate: modifyEmployee, isLoading: isUpdating } = useTauriMutation(updateEmployee);

  const handleAddEmployee = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      await createEmployee({
        first_name: formData.get('first_name') as string,
        last_name: formData.get('last_name') as string,
        role: formData.get('role') as string || null,
        employment_type: formData.get('employment_type') as string,
        status: 'active',
      });

      setIsAddingEmployee(false);
      refetch();
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      console.error('Błąd dodawania pracownika:', err);
      alert('Nie udało się dodać pracownika');
    }
  };

  const handleUpdateEmployee = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingEmployee) return;

    const formData = new FormData(e.currentTarget);

    try {
      await modifyEmployee({
        id: editingEmployee.id,
        first_name: formData.get('first_name') as string,
        last_name: formData.get('last_name') as string,
        role: formData.get('role') as string || null,
        employment_type: formData.get('employment_type') as string,
        status: formData.get('status') as string,
      });

      setEditingEmployee(null);
      refetch();
    } catch (err) {
      console.error('Błąd aktualizacji pracownika:', err);
      alert('Nie udało się zaktualizować pracownika');
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Zarządzanie Pracownikami</h1>
        <p>Ładowanie...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Zarządzanie Pracownikami</h1>
        <p className="text-red-600">Błąd: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Zarządzanie Pracownikami</h1>
        <button
          onClick={() => setIsAddingEmployee(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Dodaj Pracownika
        </button>
      </div>

      {/* Add Employee Form */}
      {isAddingEmployee && (
        <div className="mb-6 p-4 border rounded bg-gray-50">
          <h2 className="text-xl font-semibold mb-4">Nowy Pracownik</h2>
          <form onSubmit={handleAddEmployee} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Imię <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="first_name"
                  required
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Nazwisko <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="last_name"
                  required
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Rola</label>
                <input
                  type="text"
                  name="role"
                  placeholder="np. Manager, Recepcjonista"
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Wymiar Etatu <span className="text-red-600">*</span>
                </label>
                <select
                  name="employment_type"
                  required
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="Pełny etat">Pełny etat</option>
                  <option value="Pół etatu">Pół etatu</option>
                  <option value="3/4 etatu">3/4 etatu</option>
                  <option value="1/4 etatu">1/4 etatu</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isCreating}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                {isCreating ? 'Dodawanie...' : 'Zapisz'}
              </button>
              <button
                type="button"
                onClick={() => setIsAddingEmployee(false)}
                className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                Anuluj
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Employee Form */}
      {editingEmployee && (
        <div className="mb-6 p-4 border rounded bg-gray-50">
          <h2 className="text-xl font-semibold mb-4">Edytuj Pracownika</h2>
          <form onSubmit={handleUpdateEmployee} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Imię <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="first_name"
                  required
                  defaultValue={editingEmployee.first_name}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Nazwisko <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="last_name"
                  required
                  defaultValue={editingEmployee.last_name}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Rola</label>
                <input
                  type="text"
                  name="role"
                  defaultValue={editingEmployee.role || ''}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Wymiar Etatu <span className="text-red-600">*</span>
                </label>
                <select
                  name="employment_type"
                  required
                  defaultValue={editingEmployee.employment_type}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="Pełny etat">Pełny etat</option>
                  <option value="Pół etatu">Pół etatu</option>
                  <option value="3/4 etatu">3/4 etatu</option>
                  <option value="1/4 etatu">1/4 etatu</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  name="status"
                  defaultValue={editingEmployee.status}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="active">Aktywny</option>
                  <option value="inactive">Nieaktywny</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isUpdating}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                {isUpdating ? 'Zapisywanie...' : 'Zapisz Zmiany'}
              </button>
              <button
                type="button"
                onClick={() => setEditingEmployee(null)}
                className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                Anuluj
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Employee List */}
      <div className="border rounded overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Imię i Nazwisko</th>
              <th className="px-4 py-2 text-left">Rola</th>
              <th className="px-4 py-2 text-left">Wymiar Etatu</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Akcje</th>
            </tr>
          </thead>
          <tbody>
            {employees && employees.length > 0 ? (
              employees.map((employee) => (
                <tr key={employee.id} className="border-t">
                  <td className="px-4 py-2">
                    {employee.first_name} {employee.last_name}
                  </td>
                  <td className="px-4 py-2">{employee.role || '-'}</td>
                  <td className="px-4 py-2">{employee.employment_type}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        employee.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {employee.status === 'active' ? 'Aktywny' : 'Nieaktywny'}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => setEditingEmployee(employee)}
                      className="text-blue-600 hover:underline"
                    >
                      Edytuj
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  Brak pracowników. Dodaj pierwszego pracownika powyżej.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
