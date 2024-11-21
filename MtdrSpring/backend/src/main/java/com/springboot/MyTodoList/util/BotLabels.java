package com.springboot.MyTodoList.util;

public enum BotLabels {
	
	SHOW_MAIN_SCREEN("Mostrar Menú Principal"), 
	HIDE_MAIN_SCREEN("Esconder Menú Principal"),
	LIST_ALL_ITEMS("Listar Todas las Tareas"), 
	ADD_NEW_ITEM("Agregar Nueva Tarea"),
	DONE("DONE"),
	UNDO("UNDO"),
	DELETE("DELETE"),
	MY_TODO_LIST("MY TODO LIST"),
	DASH("-");

	private String label;

	BotLabels(String enumLabel) {
		this.label = enumLabel;
	}

	public String getLabel() {
		return label;
	}

}
