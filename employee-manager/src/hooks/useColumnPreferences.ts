import { useState, useEffect } from 'react';
import { Employee } from '../types';

export interface ColumnConfig {
  key: keyof Employee | 'actions';
  label: string;
  visible: boolean;
  sortable: boolean;
  width: number;
  minWidth: number;
  maxWidth: number;
  resizable: boolean;
  icon?: any;
  formatter?: (value: any, employee?: Employee) => React.ReactNode;
}

const COLUMN_PREFERENCES_KEY = 'employee-manager-column-preferences';

export const useColumnPreferences = (defaultColumns: ColumnConfig[]) => {
  const [columns, setColumns] = useState<ColumnConfig[]>(defaultColumns);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load column preferences from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(COLUMN_PREFERENCES_KEY);
      if (stored) {
        const savedPreferences = JSON.parse(stored);
        
        // Merge saved preferences with default columns
        // This ensures new columns are added with defaults while preserving user preferences
        const mergedColumns = defaultColumns.map(defaultCol => {
          const savedCol = savedPreferences.find((saved: any) => saved.key === defaultCol.key);
          return savedCol ? { ...defaultCol, visible: savedCol.visible } : defaultCol;
        });
        
        setColumns(mergedColumns);
      }
    } catch (error) {
      console.error('Failed to load column preferences:', error);
      setColumns(defaultColumns);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save column preferences to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      try {
        // Only save the key and visible properties to keep storage lean
        const preferencesToSave = columns.map(col => ({
          key: col.key,
          visible: col.visible
        }));
        localStorage.setItem(COLUMN_PREFERENCES_KEY, JSON.stringify(preferencesToSave));
      } catch (error) {
        console.error('Failed to save column preferences:', error);
      }
    }
  }, [columns, isLoaded]);

  const updateColumns = (newColumns: ColumnConfig[]) => {
    setColumns(newColumns);
  };

  const toggleColumnVisibility = (columnKey: string) => {
    setColumns(prev => prev.map(col => 
      col.key === columnKey ? { ...col, visible: !col.visible } : col
    ));
  };

  const resetColumnPreferences = () => {
    setColumns(defaultColumns);
  };

  return {
    columns,
    updateColumns,
    toggleColumnVisibility,
    resetColumnPreferences,
    isLoaded
  };
};
