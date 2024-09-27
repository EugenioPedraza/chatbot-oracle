package com.springboot.MyTodoList.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.springboot.MyTodoList.model.ToDoItem;
import com.springboot.MyTodoList.repository.ToDoItemRepository;

@Service
public class ToDoItemService {

    @Autowired
    private ToDoItemRepository toDoItemRepository;

    // Servicio para encontrar todos los items
    public List<ToDoItem> findAll(){
        List<ToDoItem> todoItems = toDoItemRepository.findAll();
        return todoItems;
    }

    // Encontrar un item por su ID
    public ResponseEntity<ToDoItem> getItemById(int id){
        Optional<ToDoItem> todoData = toDoItemRepository.findById(id);
        if (todoData.isPresent()){
            return new ResponseEntity<>(todoData.get(), HttpStatus.OK);
        }else{
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Añadir un item
    public ToDoItem addToDoItem(ToDoItem toDoItem){
        return toDoItemRepository.save(toDoItem);
    }

    // Borrar un item
    public boolean deleteToDoItem(int id){
        try{
            toDoItemRepository.deleteById(id);
            return true;
        }catch(Exception e){
            return false;
        }
    }

    // Actualizar un item
    public ToDoItem updateToDoItem(int id, ToDoItem td){
        Optional<ToDoItem> toDoItemData = toDoItemRepository.findById(id);
        if(toDoItemData.isPresent()){
            ToDoItem toDoItem2 = toDoItemData.get();
            toDoItem2.setID(id);
            toDoItem2.setCreation_ts(td.getCreation_ts());
            toDoItem2.setDescription(td.getDescription());
            toDoItem2.setDone(td.isDone());
            return toDoItemRepository.save(toDoItem2);
        }else{
            return null;
        }
    }

}
