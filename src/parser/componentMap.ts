// 组件名称映射：将 widgetName 映射到全局组件名称
const componentMap: Record<string, string> = {
  briefingCard: 'BriefingCard',
  steps: 'Steps',
  tab: 'Tab',
  formField: 'FormField',
  dataTable: 'DataTable',
  dataEntry: 'DataEntry',
  dataDynamics: 'DataDynamics',
  timeLine: 'TimeLine',
  carousel: 'Carousel',
  richText: 'RichText',
  iframe: 'Iframe',
};

export function getComponentName(widgetName: string): string {
  return componentMap[widgetName] || 'BriefingCard';
}
