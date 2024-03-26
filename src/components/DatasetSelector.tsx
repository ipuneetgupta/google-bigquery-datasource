import { SelectableValue } from '@grafana/data';
import { Select } from '@grafana/ui';
import React, { useEffect } from 'react';
import { useAsync } from 'react-use';
import { ResourceSelectorProps } from 'types';
import { toOption } from 'utils/data';

interface DatasetSelectorProps extends ResourceSelectorProps {
  value: string | null;
  project: string;
  location: string;
  applyDefault?: boolean;
  disabled?: boolean;
  onChange: (v: SelectableValue) => void;
}

export const DatasetSelector: React.FC<DatasetSelectorProps> = ({
  apiClient,
  location,
  value,
  project,
  onChange,
  disabled,
  className,
  applyDefault,
}) => {
  const state = useAsync(async () => {
    try {
      const datasets = await apiClient.getDatasets(location, project);
      return datasets.map((dataset) => ({ label: dataset, value: dataset }));
    } catch (error) {
      return [];
    }
  }, [location, project]);

  useEffect(() => {
    if (!applyDefault) {
      return;
    }
    // Set default dataset when values are fetched
    if (!value) {
      if (state.value && state.value[0]) {
        onChange(state.value[0]);
      }
    } else {
      if (state.value && state.value.find((v) => v.value === value) === undefined) {
        // if value is set and newly fetched values does not contain selected value
        if (state.value.length > 0) {
          onChange(state.value[0]);
        }
      }
    }
  }, [state.value, value, location, applyDefault, onChange]);

  return (
    <Select
      className={className}
      aria-label="Dataset selector"
      value={value}
      allowCustomValue
      options={state.value || [{ label: value, value }]}
      onChange={onChange}
      disabled={disabled}
      isLoading={state.loading}
      menuShouldPortal={true}
    />
  );
};
