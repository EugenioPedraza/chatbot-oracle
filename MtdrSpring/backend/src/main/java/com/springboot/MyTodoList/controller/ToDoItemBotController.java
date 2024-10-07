package com.springboot.MyTodoList.controller;

import java.util.*;
import java.text.SimpleDateFormat;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.telegram.telegrambots.bots.TelegramLongPollingBot;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.objects.Update;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.ReplyKeyboardMarkup;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.ReplyKeyboardRemove;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.KeyboardRow;
import org.telegram.telegrambots.meta.exceptions.TelegramApiException;

import com.springboot.MyTodoList.model.Tarea;
import com.springboot.MyTodoList.service.TareaService;
import com.springboot.MyTodoList.util.BotCommands;
import com.springboot.MyTodoList.util.BotHelper;
import com.springboot.MyTodoList.util.BotLabels;
import com.springboot.MyTodoList.util.BotMessages;

public class ToDoItemBotController extends TelegramLongPollingBot {

    private static final Logger logger = LoggerFactory.getLogger(ToDoItemBotController.class);
    private TareaService tareaService;
    private String botName;
    private Map<Long, String> lastCommand = new HashMap<>();
    private Map<Long, Map<String, String>> userConversationState = new HashMap<>();
    private static final String[] TAREA_FIELDS = {"descripcion", "fechaVencimiento", "idSprint", "idUsuario"};
    private static final int FIELD_INDEX_DESCRIPCION = 0;

    public ToDoItemBotController(String botToken, String botName, TareaService tareaService) {
        super(botToken);
        logger.info("Bot Token: " + botToken);
        logger.info("Bot name: " + botName);
        this.tareaService = tareaService;
        this.botName = botName;
    }

    @Override
    public void onUpdateReceived(Update update) {
        if (update.hasMessage() && update.getMessage().hasText()) {
            String messageTextFromTelegram = update.getMessage().getText();
            long chatId = update.getMessage().getChatId();

            if (messageTextFromTelegram.equals(BotCommands.START_COMMAND.getCommand())
                    || messageTextFromTelegram.equals(BotLabels.SHOW_MAIN_SCREEN.getLabel())) {
                showMainMenu(chatId);
            } else if (messageTextFromTelegram.indexOf(BotLabels.DONE.getLabel()) != -1) {
                markTareaAsDone(chatId, messageTextFromTelegram);
            } else if (messageTextFromTelegram.indexOf(BotLabels.UNDO.getLabel()) != -1) {
                undoTarea(chatId, messageTextFromTelegram);
            } else if (messageTextFromTelegram.indexOf(BotLabels.DELETE.getLabel()) != -1) {
                deleteTarea(chatId, messageTextFromTelegram);
            } else if (messageTextFromTelegram.equals(BotCommands.HIDE_COMMAND.getCommand())
                    || messageTextFromTelegram.equals(BotLabels.HIDE_MAIN_SCREEN.getLabel())) {
                BotHelper.sendMessageToTelegram(chatId, BotMessages.BYE.getMessage(), this);
            } else if (messageTextFromTelegram.equals(BotCommands.TODO_LIST.getCommand())
                    || messageTextFromTelegram.equals(BotLabels.LIST_ALL_ITEMS.getLabel())
                    || messageTextFromTelegram.equals(BotLabels.MY_TODO_LIST.getLabel())) {
                showTareaList(chatId);
            } else if (messageTextFromTelegram.equals(BotCommands.ADD_ITEM.getCommand())
                    || messageTextFromTelegram.equals(BotLabels.ADD_NEW_ITEM.getLabel())) {
                startNewTareaConversation(chatId);
            } else if (userConversationState.containsKey(chatId)) {
                handleTareaInput(chatId, messageTextFromTelegram);
            } else {
                BotHelper.sendMessageToTelegram(chatId, "Lo siento, no entiendo ese comando. Por favor, usa el menú principal.", this);
            }
        }
    }

    private void showMainMenu(long chatId) {
        SendMessage messageToTelegram = new SendMessage();
        messageToTelegram.setChatId(chatId);
        messageToTelegram.setText(BotMessages.HELLO_MYTODO_BOT.getMessage());

        ReplyKeyboardMarkup keyboardMarkup = new ReplyKeyboardMarkup();
        List<KeyboardRow> keyboard = new ArrayList<>();

        KeyboardRow row = new KeyboardRow();
        row.add(BotLabels.LIST_ALL_ITEMS.getLabel());
        row.add(BotLabels.ADD_NEW_ITEM.getLabel());
        keyboard.add(row);

        row = new KeyboardRow();
        row.add(BotLabels.SHOW_MAIN_SCREEN.getLabel());
        row.add(BotLabels.HIDE_MAIN_SCREEN.getLabel());
        keyboard.add(row);

        keyboardMarkup.setKeyboard(keyboard);
        messageToTelegram.setReplyMarkup(keyboardMarkup);

        try {
            execute(messageToTelegram);
        } catch (TelegramApiException e) {
            logger.error(e.getLocalizedMessage(), e);
        }
    }

    private void markTareaAsDone(long chatId, String messageText) {
        String done = messageText.substring(0, messageText.indexOf(BotLabels.DASH.getLabel()));
        Integer id = Integer.valueOf(done);

        try {
            Tarea tarea = tareaService.getTareaById(id);
            tarea.setEstadoTarea(true);
            tareaService.updateTarea(id, tarea);
            BotHelper.sendMessageToTelegram(chatId, BotMessages.ITEM_DONE.getMessage(), this);
        } catch (Exception e) {
            logger.error(e.getLocalizedMessage(), e);
        }
    }

    private void undoTarea(long chatId, String messageText) {
        String undo = messageText.substring(0, messageText.indexOf(BotLabels.DASH.getLabel()));
        Integer id = Integer.valueOf(undo);

        try {
            Tarea tarea = tareaService.getTareaById(id);
            tarea.setEstadoTarea(false);
            tareaService.updateTarea(id, tarea);
            BotHelper.sendMessageToTelegram(chatId, BotMessages.ITEM_UNDONE.getMessage(), this);
        } catch (Exception e) {
            logger.error(e.getLocalizedMessage(), e);
        }
    }

    private void deleteTarea(long chatId, String messageText) {
        String delete = messageText.substring(0, messageText.indexOf(BotLabels.DASH.getLabel()));
        Integer id = Integer.valueOf(delete);

        try {
            tareaService.deleteTarea(id);
            BotHelper.sendMessageToTelegram(chatId, BotMessages.ITEM_DELETED.getMessage(), this);
        } catch (Exception e) {
            logger.error(e.getLocalizedMessage(), e);
        }
    }

    private void showTareaList(long chatId) {
        List<Tarea> allTareas = tareaService.findAll();
        ReplyKeyboardMarkup keyboardMarkup = new ReplyKeyboardMarkup();
        List<KeyboardRow> keyboard = new ArrayList<>();

        KeyboardRow mainScreenRowTop = new KeyboardRow();
        mainScreenRowTop.add(BotLabels.SHOW_MAIN_SCREEN.getLabel());
        keyboard.add(mainScreenRowTop);

        KeyboardRow firstRow = new KeyboardRow();
        firstRow.add(BotLabels.ADD_NEW_ITEM.getLabel());
        keyboard.add(firstRow);

        KeyboardRow myTodoListTitleRow = new KeyboardRow();
        myTodoListTitleRow.add(BotLabels.MY_TODO_LIST.getLabel());
        keyboard.add(myTodoListTitleRow);

        List<Tarea> activeTareas = allTareas.stream().filter(tarea -> !tarea.getEstadoTarea()).collect(Collectors.toList());

        for (Tarea tarea : activeTareas) {
            KeyboardRow currentRow = new KeyboardRow();
            currentRow.add(tarea.getDescripcionTarea());
            currentRow.add(tarea.getIDTarea() + BotLabels.DASH.getLabel() + BotLabels.DONE.getLabel());
            keyboard.add(currentRow);
        }

        List<Tarea> doneTareas = allTareas.stream().filter(Tarea::getEstadoTarea).collect(Collectors.toList());

        for (Tarea tarea : doneTareas) {
            KeyboardRow currentRow = new KeyboardRow();
            currentRow.add(tarea.getDescripcionTarea());
            currentRow.add(tarea.getIDTarea() + BotLabels.DASH.getLabel() + BotLabels.UNDO.getLabel());
            currentRow.add(tarea.getIDTarea() + BotLabels.DASH.getLabel() + BotLabels.DELETE.getLabel());
            keyboard.add(currentRow);
        }

        KeyboardRow mainScreenRowBottom = new KeyboardRow();
        mainScreenRowBottom.add(BotLabels.SHOW_MAIN_SCREEN.getLabel());
        keyboard.add(mainScreenRowBottom);

        keyboardMarkup.setKeyboard(keyboard);

        SendMessage messageToTelegram = new SendMessage();
        messageToTelegram.setChatId(chatId);
        messageToTelegram.setText(BotLabels.MY_TODO_LIST.getLabel());
        messageToTelegram.setReplyMarkup(keyboardMarkup);

        try {
            execute(messageToTelegram);
        } catch (TelegramApiException e) {
            logger.error(e.getLocalizedMessage(), e);
        }
    }

    private void startNewTareaConversation(long chatId) {
        userConversationState.put(chatId, new HashMap<>());
        askForNextTareaField(chatId);
    }

    private void askForNextTareaField(long chatId) {
        Map<String, String> state = userConversationState.get(chatId);
        int nextFieldIndex = state.size();
        if (nextFieldIndex < TAREA_FIELDS.length) {
            String nextField = TAREA_FIELDS[nextFieldIndex];
            String prompt = getPromptForField(nextField);
            BotHelper.sendMessageToTelegram(chatId, prompt, this);
        } else {
            addNewTarea(chatId);
        }
    }

    private String getPromptForField(String field) {
        switch (field) {
            case "descripcion":
                return "Por favor, ingrese la descripción de la tarea:";
            case "fechaVencimiento":
                return "Ingrese la fecha de vencimiento (formato: dd/MM/yyyy):";
            case "idSprint":
                return "Ingrese el ID del sprint (0 si no aplica):";
            case "idUsuario":
                return "Ingrese el ID del usuario asignado (0 si no está asignado):";
            default:
                return "Ingrese el valor para " + field + ":";
        }
    }

    private void handleTareaInput(long chatId, String input) {
        Map<String, String> state = userConversationState.get(chatId);
        int currentFieldIndex = state.size();
        String currentField = TAREA_FIELDS[currentFieldIndex];
        
        state.put(currentField, input);
        
        if (currentFieldIndex == TAREA_FIELDS.length - 1) {
            addNewTarea(chatId);
        } else {
            askForNextTareaField(chatId);
        }
    }

    private void addNewTarea(long chatId) {
        try {
            Map<String, String> state = userConversationState.get(chatId);
            Tarea newTarea = new Tarea();
            newTarea.setDescripcionTarea(state.get("descripcion"));
            newTarea.setFechaAsignacion(new Date());
            newTarea.setEstadoTarea(false);
            
            SimpleDateFormat dateFormat = new SimpleDateFormat("dd/MM/yyyy");
            newTarea.setFechaVencimiento(dateFormat.parse(state.get("fechaVencimiento")));
            
            newTarea.setIDSprint(Integer.parseInt(state.get("idSprint")));
            newTarea.setIDUsuario(Integer.parseInt(state.get("idUsuario")));

            Tarea savedTarea = tareaService.addTarea(newTarea);

            String responseMessage = String.format("Nueva tarea añadida:\nID: %d\nDescripción: %s\nFecha de vencimiento: %s\nID Sprint: %d\nID Usuario: %d", 
                                                   savedTarea.getIDTarea(), savedTarea.getDescripcionTarea(),
                                                   dateFormat.format(savedTarea.getFechaVencimiento()),
                                                   savedTarea.getIDSprint(), savedTarea.getIDUsuario());

            BotHelper.sendMessageToTelegram(chatId, responseMessage, this);
            
            userConversationState.remove(chatId);
            showMainMenu(chatId);
        } catch (Exception e) {
            logger.error("Error al añadir nueva tarea: " + e.getMessage(), e);
            BotHelper.sendMessageToTelegram(chatId, "Lo siento, hubo un error al añadir la tarea. Por favor, inténtalo de nuevo.", this);
            userConversationState.remove(chatId);
            showMainMenu(chatId);
        }
    }

    @Override
    public String getBotUsername() {
        return botName;
    }

    public List<Tarea> getAllTareas() {
        return tareaService.findAll();
    }

    public ResponseEntity<Tarea> getTareaById(int id) {
        try {
            Tarea tarea = tareaService.getTareaById(id);
            return new ResponseEntity<>(tarea, HttpStatus.OK);
        } catch (Exception e) {
            logger.error(e.getLocalizedMessage(), e);
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    public Tarea addTarea(Tarea tarea) throws Exception {
        return tareaService.addTarea(tarea);
    }

    public ResponseEntity<Tarea> updateTarea(int id, Tarea tarea) {
        try {
            Tarea updatedTarea = tareaService.updateTarea(id, tarea);
            return new ResponseEntity<>(updatedTarea, HttpStatus.OK);
        } catch (Exception e) {
            logger.error(e.getLocalizedMessage(), e);
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }

    public ResponseEntity<Boolean> deleteTareaById(int id) {
        try {
            boolean deleted = tareaService.deleteTarea(id);
            return new ResponseEntity<>(deleted, HttpStatus.OK);
        } catch (Exception e) {
            logger.error(e.getLocalizedMessage(), e);
            return new ResponseEntity<>(false, HttpStatus.NOT_FOUND);
        }
    }
}