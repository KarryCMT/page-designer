/**
 * 属性编辑器工厂 - 工厂模式
 * 根据组件类型动态创建对应的属性编辑器
 */
import { Component } from 'vue';
import BriefingCardEditor from './BriefingCardEditor.vue';
import TabEditor from './TabEditor.vue';
import FormFieldEditor from './FormFieldEditor.vue';
import DataTableEditor from './DataTableEditor.vue';
import CommonEditor from './CommonEditor.vue';

export class PropertyEditorFactory {
    private static instance: PropertyEditorFactory;
    private editors: Map<string, Component>;

    private constructor() {
        this.editors = new Map();
        this.registerEditors();
    }

    public static getInstance(): PropertyEditorFactory {
        if (!PropertyEditorFactory.instance) {
            PropertyEditorFactory.instance = new PropertyEditorFactory();
        }
        return PropertyEditorFactory.instance;
    }

    /**
     * 注册所有属性编辑器
     */
    private registerEditors(): void {
        // 注册各个组件的属性编辑器
        this.editors.set('briefingCard', BriefingCardEditor);
        this.editors.set('tab', TabEditor);
        this.editors.set('formField', FormFieldEditor);
        this.editors.set('dataTable', DataTableEditor);
        this.editors.set('steps', CommonEditor);
        this.editors.set('dataEntry', CommonEditor);
        this.editors.set('dataDynamics', CommonEditor);
        this.editors.set('timeLine', CommonEditor);
        this.editors.set('carousel', CommonEditor);
        this.editors.set('richText', CommonEditor);
        this.editors.set('iframe', CommonEditor);
    }

    /**
     * 获取指定类型的属性编辑器
     */
    public getEditor(componentType: string): Component | null {
        return this.editors.get(componentType) || CommonEditor;
    }

    /**
     * 注册新的属性编辑器
     */
    public registerEditor(componentType: string, editor: Component): void {
        this.editors.set(componentType, editor);
    }

    /**
     * 检查是否有对应的编辑器
     */
    public hasEditor(componentType: string): boolean {
        return this.editors.has(componentType);
    }
}
