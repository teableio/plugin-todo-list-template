import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FieldType } from "@teable/core";
import { getFields, getRecords, updateRecord } from "@teable/openapi";
import { useViewId } from "@teable/sdk";
import { Checkbox, cn, Spin } from "@teable/ui-lib";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

export const TodoList = ({ tableId }: { tableId: string }) => {
  const viewId = useViewId();
  const { t } = useTranslation();

  const queryClient = useQueryClient();
  const recordQueryKeys = ['get-records', tableId, { viewId, skip: 0, limit: 20 }] as const;
  const { data: records } = useQuery({
    queryKey: recordQueryKeys,
    queryFn: ({ queryKey }) => getRecords(queryKey[1], queryKey[2]).then(res => res.data.records),
  });

  const { data: fields, isLoading: isFieldsLoading } = useQuery({
    queryKey: ['get-fields', tableId] as const,
    queryFn: ({ queryKey }) => getFields(queryKey[1]).then(res => res.data),
  });

  const { mutate: updateRecordMutation } = useMutation({
    mutationFn: ({ id, fields }: { id: string, fields: Record<string, any> }) => updateRecord(tableId, id, { record: { fields } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recordQueryKeys });
    }
  });

  const checkboxField = useMemo(() => {
    return fields?.find(f => f.type === FieldType.Checkbox);
  }, [fields]);

  if (!checkboxField && !isFieldsLoading) {
    return <div className="text-muted-foreground py-2 text-center">{t('noCheckboxField')}</div>;
  }

  if (!records || !checkboxField ) {
    return <Spin />
  }

  const handleCheckboxChange = (id: string, checked: boolean) => {
    updateRecordMutation({ id, fields: { [checkboxField.name]: checked } });
  }

  return (
    <div className="space-y-2 px-2 py-3">
      {
        records.map(v => {
          const isCompleted = Boolean(v.fields[checkboxField.name]);
          return (
            <div key={v.id} className="flex items-center gap-2 p-1.5 border rounded-md">
              <Checkbox checked={isCompleted} onCheckedChange={(checked) => handleCheckboxChange(v.id, checked as boolean)}/>
              <div className={
                cn('ml-2 flex-1 relative', {
                  'text-muted-foreground': isCompleted,
                })
              }>{v.name}
                <div className={
                  cn('hidden absolute top-[50%] left-0 w-full border-t bg-muted-foreground', {
                    'block': isCompleted,
                  })
                }/>
              </div>
            </div>
          )
        })
      }
    </div>
  );
};
