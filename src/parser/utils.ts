import { basicComponents } from '../config/components';

export function getComponentInfo(item: any) {
  const component = basicComponents.find(
    (comp) => comp.widgetName === item.type
  );
  return {
    label: component?.label || '未知组件',
    icon: component?.icon || 'Grid',
  };
}
