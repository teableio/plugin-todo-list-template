import { useTranslation } from "react-i18next";
import { TodoList } from "./TodoList";
import { useContext } from "react";
import { EvnContext } from "./context/EnvProvider";
import { useInitApi } from "@/hooks/useInitApi";

export const TodoListPages = () => {
  const { t } = useTranslation();
  const { tableId } = useContext(EvnContext);
  const isInit = useInitApi();

  if (!tableId || !isInit) {
    return <div>No tableId</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <h1 className="pl-3 py-1">{t('title')}</h1>
      <TodoList tableId={tableId} />
    </div>
  );
};
