package com.springboot.MyTodoList.controller;

import java.text.SimpleDateFormat;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.telegram.telegrambots.bots.TelegramLongPollingBot;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.objects.Update;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.ReplyKeyboardMarkup;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.ReplyKeyboardRemove;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.KeyboardRow;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.InlineKeyboardMarkup;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.InlineKeyboardButton;
import org.telegram.telegrambots.meta.exceptions.TelegramApiException;

import com.springboot.MyTodoList.model.Tarea;
import com.springboot.MyTodoList.service.TareaService;
import com.springboot.MyTodoList.service.UsuarioService;
import com.springboot.MyTodoList.util.BotCommands;
import com.springboot.MyTodoList.util.BotHelper;
import com.springboot.MyTodoList.util.BotLabels;
import com.springboot.MyTodoList.util.BotMessages;

import javax.annotation.PostConstruct;
import java.time.ZoneId;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.time.ZonedDateTime;

@Controller
public class ToDoItemBotController extends TelegramLongPollingBot {

    private static final Logger logger = LoggerFactory.getLogger(ToDoItemBotController.class);
    private TareaService tareaService;
    private UsuarioService userService;
    private String botName;

    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
    private final Map<Long, Integer> chatIds = Map.of(
        6067521705L, 9
        //1397467938L, 3,
        //7251309646L, 2,
        //6414293359L, 4,
        //7525373544L, 1
    );

    @Autowired
    public ToDoItemBotController(@Qualifier("botToken") String botToken, @Qualifier("botName") String botName, TareaService tareaService, UsuarioService userService) {
        super(botToken);
        logger.info("Bot Token: " + botToken);
        logger.info("Bot name: " + botName);
        this.tareaService = tareaService;
        this.userService = userService;
        this.botName = botName;
    }

    @PostConstruct
    public void initializeNotificationScheduler() {
        // Primer parametro es la hora, segundo el minuto, tercero cual es la notificacion que se enviará
        scheduleNotification(16, 52, 1);
        scheduleNotification(16, 54, 2);
    }

    @Override
    public void onUpdateReceived(Update update) {
        if (update.hasMessage() && update.getMessage().hasText()) {
            String messageTextFromTelegram = update.getMessage().getText();
            long chatId = update.getMessage().getChatId();

            if (messageTextFromTelegram.startsWith("/delete")) {
                handleDeleteCommand(chatId, messageTextFromTelegram);
            } else if (messageTextFromTelegram.equals(BotCommands.START_COMMAND.getCommand())
                    || messageTextFromTelegram.equals(BotLabels.SHOW_MAIN_SCREEN.getLabel())) {
                showMainMenu(chatId);
            } else if (messageTextFromTelegram.indexOf(BotLabels.DONE.getLabel()) != -1) {
                markTareaAsDone(chatId, messageTextFromTelegram);
            } else if (messageTextFromTelegram.indexOf(BotLabels.UNDO.getLabel()) != -1) {
                undoTarea(chatId, messageTextFromTelegram);
            } else if (messageTextFromTelegram.indexOf(BotLabels.DELETE.getLabel()) != -1) {
                deleteTarea(chatId, messageTextFromTelegram);
            } else if (messageTextFromTelegram.equals("Eliminar Tarea")) {
                promptForTaskId(chatId);
            } else if (messageTextFromTelegram.equals(BotCommands.HIDE_COMMAND.getCommand())
                    || messageTextFromTelegram.equals(BotLabels.HIDE_MAIN_SCREEN.getLabel())) {
                BotHelper.sendMessageToTelegram(chatId, BotMessages.BYE.getMessage(), this);
            } else if (messageTextFromTelegram.equals(BotCommands.TODO_LIST.getCommand())
                    || messageTextFromTelegram.equals(BotLabels.LIST_ALL_ITEMS.getLabel())
                    || messageTextFromTelegram.equals(BotLabels.MY_TODO_LIST.getLabel())) {
                showTareaList(chatId);
            } else if (messageTextFromTelegram.equals(BotCommands.ADD_ITEM.getCommand())
                    || messageTextFromTelegram.equals(BotLabels.ADD_NEW_ITEM.getLabel())) {
                promptForNewTarea(chatId);
            } else {
                if (messageTextFromTelegram.matches("\\d+")) {
                    deleteTareaById(chatId, Integer.parseInt(messageTextFromTelegram));
                } else if (messageTextFromTelegram.matches("\\d+\\s*,\\s*\\d+")) {
                    updateTareaHoras(chatId, messageTextFromTelegram);
                } else {
                    addNewTarea(chatId, messageTextFromTelegram);
                }
            }
        } else if (update.hasCallbackQuery()) {
            String callData = update.getCallbackQuery().getData();
            long chatId = update.getCallbackQuery().getMessage().getChatId();

            if (callData.startsWith("TASK_")) {
                int taskId = Integer.parseInt(callData.substring(5));
                showTaskDetails(chatId, taskId);
            }
        }
    }

    public void scheduleNotification(int hour, int minute, int idNotification) {
        ZoneId zoneId = ZoneId.of("America/Mexico_City");
        ZonedDateTime now = ZonedDateTime.now(zoneId);
        ZonedDateTime scheduledTime = now.withHour(hour).withMinute(minute).withSecond(0);

        if (now.isAfter(scheduledTime)) {
            scheduledTime = scheduledTime.plusDays(1);
        }

        long initialDelay = java.time.Duration.between(now, scheduledTime).toMillis();
        long period = TimeUnit.DAYS.toMillis(1);

        scheduler.scheduleAtFixedRate(() -> sendNotificationsToAllChatIds(idNotification), initialDelay, period, TimeUnit.MILLISECONDS);
    }

    private void sendNotificationsToAllChatIds(int idNotification) {
        for (Map.Entry<Long, Integer> entry : chatIds.entrySet()) {
            long chatId = entry.getKey();
            Integer userId = entry.getValue();
            SendMessage messageToTelegram;

            if (idNotification == 1) {
                messageToTelegram = firstNotification(chatId, userId);
            } else if (idNotification == 2) {
                messageToTelegram = secondNotification(chatId, userId);
            } else {
                logger.warn("Numero de notificacion desconocido: " + idNotification);
                continue;
            }

            try {
                execute(messageToTelegram);
            } catch (TelegramApiException e) {
                logger.error(e.getLocalizedMessage(), e);
            }
        }
    }    

    private SendMessage firstNotification(long chatId, Integer userId){
        String userName = userService.getUsernameById(userId);

        List<Tarea> allTareas = tareaService.findAll();
        List<Tarea> pendingTareasForUser = allTareas.stream()
            .filter(tarea -> tarea.getIDUsuario() == userId && !tarea.getEstadoTarea())
            .collect(Collectors.toList());

        InlineKeyboardMarkup markupInline = new InlineKeyboardMarkup();
        List<List<InlineKeyboardButton>> rowsInline = new ArrayList<>();

        if (pendingTareasForUser.isEmpty()) {
            SendMessage messageToTelegram = new SendMessage();
            messageToTelegram.setChatId(chatId);
            messageToTelegram.setText("No tienes tareas pendientes " + userName + "!");
            return messageToTelegram;
        } else {
            addDarkHeaderRow(rowsInline, "Tareas Pendientes");
    
            for (Tarea tarea : pendingTareasForUser) {
                addTaskButton(rowsInline, tarea);
            }

            markupInline.setKeyboard(rowsInline);
    
            SendMessage messageToTelegram = new SendMessage();
            messageToTelegram.setChatId(chatId);
            messageToTelegram.setText("Estas son tus tareas pendientes " + userName + ":");
            messageToTelegram.setReplyMarkup(markupInline);
            return messageToTelegram;
        }
    }

    private SendMessage secondNotification(long chatId, Integer userId){
        String userName = userService.getUsernameById(userId);

        SendMessage messageToTelegram = new SendMessage();
        messageToTelegram.setChatId(chatId);
        messageToTelegram.setText("No olvides reportar tus avances del día " + userName + "!" + " Usa el siguiente formato:\n" +
                                "ID de la tarea, Horas avanzadas\n" +
                                "Ejemplo: 125, 4");
        return messageToTelegram;
    }

    private void handleDeleteCommand(long chatId, String messageText) {
        try {
            String[] parts = messageText.split(" ");
            if (parts.length != 2) {
                BotHelper.sendMessageToTelegram(chatId,
                    "Por favor, proporciona el ID de la tarea a eliminar. Uso: /delete <ID_TAREA>", this);
                return;
            }

            int tareaId = Integer.parseInt(parts[1]);
            boolean deleted = tareaService.deleteTarea(tareaId);

            if (deleted) {
                BotHelper.sendMessageToTelegram(chatId, "Tarea eliminada exitosamente.", this);
            } else {
                BotHelper.sendMessageToTelegram(chatId, "No se encontró la tarea con el ID proporcionado.", this);
            }
        } catch (NumberFormatException e) {
            BotHelper.sendMessageToTelegram(chatId, "ID de tarea inválido. Por favor, proporciona un número válido.", this);
        } catch (Exception e) {
            logger.error("Error al eliminar la tarea: " + e.getMessage(), e);
            BotHelper.sendMessageToTelegram(chatId,
                "Lo siento, hubo un error al eliminar la tarea. Por favor, inténtalo de nuevo.", this);
        }
    }

    private void showMainMenu(long chatId) {
        SendMessage messageToTelegram = new SendMessage();
        messageToTelegram.setChatId(chatId);
        messageToTelegram.setText(BotMessages.HELLO_MYTODO_BOT.getMessage());

        // Configurar teclado personalizado
        ReplyKeyboardMarkup keyboardMarkup = new ReplyKeyboardMarkup();
        List<KeyboardRow> keyboard = new ArrayList<>();

        // Primera fila: Listar y Agregar ítems
        KeyboardRow row1 = new KeyboardRow();
        row1.add(BotLabels.LIST_ALL_ITEMS.getLabel());
        row1.add(BotLabels.ADD_NEW_ITEM.getLabel());
        keyboard.add(row1);

        // Segunda fila: Mostrar y Ocultar pantalla principal
        KeyboardRow row2 = new KeyboardRow();
        row2.add(BotLabels.SHOW_MAIN_SCREEN.getLabel());
        row2.add(BotLabels.HIDE_MAIN_SCREEN.getLabel());
        keyboard.add(row2);

        // Tercera fila: Botón para eliminar tarea
        KeyboardRow row3 = new KeyboardRow();
        row3.add("Eliminar Tarea");
        keyboard.add(row3);

        // Establece el teclado en el mensaje
        keyboardMarkup.setKeyboard(keyboard);
        keyboardMarkup.setResizeKeyboard(true);
        keyboardMarkup.setOneTimeKeyboard(false);
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

        Map<Integer, List<Tarea>> completedTareasBySprint = allTareas.stream()
            .filter(Tarea::getEstadoTarea)
            .collect(Collectors.groupingBy(Tarea::getIDSprint, TreeMap::new, Collectors.toList()));

        Map<Integer, List<Tarea>> pendingTareasBySprint = allTareas.stream()
            .filter(tarea -> !tarea.getEstadoTarea())
            .collect(Collectors.groupingBy(Tarea::getIDSprint, TreeMap::new, Collectors.toList()));

        InlineKeyboardMarkup markupInline = new InlineKeyboardMarkup();
        List<List<InlineKeyboardButton>> rowsInline = new ArrayList<>();

        addDarkHeaderRow(rowsInline, "Tareas Pendientes");

        for (Map.Entry<Integer, List<Tarea>> entry : pendingTareasBySprint.entrySet()) {
            addDarkHeaderRow(rowsInline, "Sprint " + entry.getKey());
            for (Tarea tarea : entry.getValue()) {
                addTaskButton(rowsInline, tarea);
            }
        }

        addDarkHeaderRow(rowsInline, "Tareas Completadas");

        for (Map.Entry<Integer, List<Tarea>> entry : completedTareasBySprint.entrySet()) {
            addDarkHeaderRow(rowsInline, "Sprint " + entry.getKey());
            for (Tarea tarea : entry.getValue()) {
                addTaskButton(rowsInline, tarea);
            }
        }

        markupInline.setKeyboard(rowsInline);

        SendMessage message = new SendMessage();
        message.setChatId(chatId);
        message.setText("Here's your organized task list. Click on a task to see details:");
        message.setReplyMarkup(markupInline);

        try {
            execute(message);
        } catch (TelegramApiException e) {
            logger.error("Error sending organized task list", e);
        }
    }

    private void addDarkHeaderRow(List<List<InlineKeyboardButton>> rowsInline, String headerText) {
        List<InlineKeyboardButton> headerRow = new ArrayList<>();
        InlineKeyboardButton headerButton = new InlineKeyboardButton();
        headerButton.setText("▪️▪️▪️▪️▪️ " + headerText + " ▪️▪️▪️▪️▪️");  
        headerButton.setCallbackData("HEADER_" + headerText);
        headerRow.add(headerButton);
        rowsInline.add(headerRow);
    }

    private void addTaskButton(List<List<InlineKeyboardButton>> rowsInline, Tarea tarea) {
        List<InlineKeyboardButton> rowInline = new ArrayList<>();
        InlineKeyboardButton taskButton = new InlineKeyboardButton();
        taskButton.setText(tarea.getDescripcionTarea());
        taskButton.setCallbackData("TASK_" + tarea.getIDTarea());
        rowInline.add(taskButton);
        rowsInline.add(rowInline);
    }

    private void showTaskDetails(long chatId, int taskId) {
        try {
            Tarea tarea = tareaService.getTareaById(taskId);
            SimpleDateFormat dateFormat = new SimpleDateFormat("dd/MM/yyyy");
            
            String details = String.format(
                "Task Details:\n" +
                "ID: %d\n" +
                "Description: %s\n" +
                "Status: %s\n" +
                "Due Date: %s\n" +
                "Assigned Date: %s\n" +
                "Sprint ID: %d\n" +
                "User ID: %d\n" +
                "Points: %d\n" +
                "Start Date: %s\n" +
                "End Date: %s\n" +
                "Hours: %d",
                tarea.getIDTarea(),
                tarea.getDescripcionTarea(),
                tarea.getEstadoTarea() ? "Done" : "Pending",
                tarea.getFechaVencimiento() != null ? dateFormat.format(tarea.getFechaVencimiento()) : "Not set",
                tarea.getFechaAsignacion() != null ? dateFormat.format(tarea.getFechaAsignacion()) : "Not set",
                tarea.getIDSprint(),
                tarea.getIDUsuario(),
                tarea.getPuntos(),
                tarea.getFechaInicio() != null ? dateFormat.format(tarea.getFechaInicio()) : "Not started",
                tarea.getFechaFin() != null ? dateFormat.format(tarea.getFechaFin()) : "Not finished",
                tarea.getHoras()
            );

            SendMessage message = new SendMessage();
            message.setChatId(chatId);
            message.setText(details);

            execute(message);
        } catch (Exception e) {
            logger.error("Error showing task details", e);
            BotHelper.sendMessageToTelegram(chatId, "Error retrieving task details. Please try again.", this);
        }
    }

    private void promptForNewTarea(long chatId) {
        try {
            SendMessage messageToTelegram = new SendMessage();
            messageToTelegram.setChatId(chatId);
            messageToTelegram.setText("Por favor, ingrese la nueva tarea en el siguiente formato:\n" +
                    "Descripción, Fecha de Vencimiento (dd/MM/yyyy), ID del Sprint, ID del Usuario, Story Points\n" +
                    "Ejemplo: Realizar manual de usuario, 25/12/2023, 1, 2, 4");
            // hide keyboard
            ReplyKeyboardRemove keyboardMarkup = new ReplyKeyboardRemove(true);
            messageToTelegram.setReplyMarkup(keyboardMarkup);

            // send message
            execute(messageToTelegram);

        } catch (Exception e) {
            logger.error(e.getLocalizedMessage(), e);
        }
    }

    private void addNewTarea(long chatId, String messageTextFromTelegram) {
        try {
            String[] parts = messageTextFromTelegram.split(",");
            if (parts.length != 5) {
                BotHelper.sendMessageToTelegram(chatId, 
                    "No entiendo ese comando, asegúrate de usar el formato correcto.", this);
                return;
            }

            String descripcion = parts[0].trim();
            String fechaVencimientoStr = parts[1].trim();
            int idSprint = Integer.parseInt(parts[2].trim());
            int idUsuario = Integer.parseInt(parts[3].trim());
            int puntos = Integer.parseInt(parts[4].trim());

            SimpleDateFormat sdf = new SimpleDateFormat("dd/MM/yyyy");
            Date fechaVencimiento = sdf.parse(fechaVencimientoStr);

            Tarea newTarea = new Tarea();
            newTarea.setDescripcionTarea(descripcion);
            newTarea.setFechaVencimiento(fechaVencimiento);
            newTarea.setIDSprint(idSprint);
            newTarea.setIDUsuario(idUsuario);
            newTarea.setPuntos(puntos);
            newTarea.setEstadoTarea(false);
            newTarea.setFechaAsignacion(Date.from(OffsetDateTime.now().toInstant()));

            tareaService.addTarea(newTarea);

            SendMessage messageToTelegram = new SendMessage();
            messageToTelegram.setChatId(chatId);
            messageToTelegram.setText(BotMessages.NEW_ITEM_ADDED.getMessage());

            execute(messageToTelegram);
        } catch (Exception e) {
            logger.error(e.getLocalizedMessage(), e);
            BotHelper.sendMessageToTelegram(chatId, "Error al añadir la tarea. Por favor, intente de nuevo.", this);
        }
    }

    private void promptForTaskId(long chatId) {
        BotHelper.sendMessageToTelegram(chatId, "Por favor, proporciona el ID de la tarea a eliminar:", this);
    }

    private void deleteTareaById(long chatId, int tareaId) {
        try {
            boolean isDeleted = tareaService.deleteTarea(tareaId);
            if (isDeleted) {
                BotHelper.sendMessageToTelegram(chatId, "La tarea con ID " + tareaId + " ha sido eliminada.", this);
            } else {
                BotHelper.sendMessageToTelegram(chatId, "No se encontró la tarea con ID " + tareaId + ".", this);
            }
        } catch (Exception e) {
            logger.error(e.getLocalizedMessage(), e);
            BotHelper.sendMessageToTelegram(chatId, "Error al eliminar la tarea. Por favor, intente de nuevo.", this);
        }
    }

    private void updateTareaHoras(long chatId, String messageTextFromTelegram) {
        String[] parts = messageTextFromTelegram.split(",");
        int tareaId = Integer.parseInt(parts[0].trim());
        int horas = Integer.parseInt(parts[1].trim());

        Tarea tarea = tareaService.getTareaById(tareaId);

        if (tarea != null) {
            int horasActuales = tarea.getHoras() != null ? tarea.getHoras() : 0;
            tarea.setHoras(horasActuales + horas);
            tareaService.addTarea(tarea);
    
            SendMessage messageToTelegram = new SendMessage();
            messageToTelegram.setChatId(chatId);
            messageToTelegram.setText("Las horas de la tarea con ID " + tareaId + " se han actualizado.");
            try {
                execute(messageToTelegram);
            } catch (TelegramApiException e) {
                logger.error("Error sending update confirmation message", e);
            }
        } else {
            SendMessage messageToTelegram = new SendMessage();
            messageToTelegram.setChatId(chatId);
            messageToTelegram.setText("No se encontró ninguna tarea con el ID " + tareaId + ".");
            try {
                execute(messageToTelegram);
            } catch (TelegramApiException e) {
                logger.error("Error sending task not found message", e);
            }
        }
    }    

    @Override
    public String getBotUsername() {
        return botName;
    }

    @Override
    public String getBotToken() {
        return super.getBotToken();
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