import { Chart as ChartJS, ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale, LineElement, PointElement } from 'chart.js';
import API_LIST from './API';

ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale, LineElement, PointElement);

const USERS_API = '/usuarios';

const userColors = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'
];

export async function loadTareas(setLoading, setChartData, setError) {
    try {
        const response = await fetch(API_LIST);
        const tareas = await response.json();
        console.log("Fetched tareas:", tareas);

        const users = await loadUsersForTasks(tareas);

        const completed = tareas.filter(t => t.estadoTarea).length;
        const pending = tareas.length - completed;

        const tareasBySprint = {};
        const sprintCompletionTimes = {};
        const sprintPoints = {};
        tareas.forEach((tarea) => {
            const sprintId = `Sprint ${tarea.idsprint}`;
            if (!tareasBySprint[sprintId]) {
                tareasBySprint[sprintId] = { completadas: 0, pendientes: 0 };
                sprintCompletionTimes[sprintId] = { totalAssignedTime: 0, totalActualTime: 0, count: 0 };
                sprintPoints[sprintId] = 0;
            }

            if (tarea.estadoTarea) {
                tareasBySprint[sprintId].completadas++;
                sprintPoints[sprintId] += tarea.puntos;
                if (tarea.fechaInicio && tarea.fechaFin) {
                    const assignedTime = new Date(tarea.fechaVencimiento) - new Date(tarea.fechaAsignacion);
                    const actualTime = new Date(tarea.fechaFin) - new Date(tarea.fechaInicio);
                    sprintCompletionTimes[sprintId].totalAssignedTime += assignedTime;
                    sprintCompletionTimes[sprintId].totalActualTime += actualTime;
                    sprintCompletionTimes[sprintId].count++;
                }
            } else {
                tareasBySprint[sprintId].pendientes++;
            }
        });

        const tareasByUser = {};
        const userProductivityOverTime = {};
        tareas.forEach((tarea) => {
            const userId = tarea.idusuario;
            const user = users.find(user => user.idUsuario === userId);
            const userName = user ? user.fullName.split(' ')[0] : `Usuario ${userId}`;
            if (!tareasByUser[userName]) {
                tareasByUser[userName] = { completadas: 0, pendientes: 0, totalTime: 0, count: 0 };
            }

            if (tarea.estadoTarea) {
                tareasByUser[userName].completadas++;
                if (tarea.fechaInicio && tarea.fechaFin) {
                    const actualTime = new Date(tarea.fechaFin) - new Date(tarea.fechaInicio);
                    tareasByUser[userName].totalTime += actualTime;
                    tareasByUser[userName].count++;
                }
            } else {
                tareasByUser[userName].pendientes++;
            }

            const completedDate = tarea.fechaFin ? new Date(tarea.fechaFin) : null;
            if (completedDate) {
                const weekStart = new Date(completedDate);
                weekStart.setDate(weekStart.getDate() - weekStart.getDay());
                const weekKey = weekStart.toISOString().split('T')[0];

                if (!userProductivityOverTime[weekKey]) {
                    userProductivityOverTime[weekKey] = {};
                }
                if (!userProductivityOverTime[weekKey][userName]) {
                    userProductivityOverTime[weekKey][userName] = 0;
                }
                userProductivityOverTime[weekKey][userName]++;
            }
        });

        const taskCompletionOverTime = {};
        const avgTaskCompletionTimeOverTime = {};
        tareas.forEach((tarea) => {
            const assignedDate = new Date(tarea.fechaAsignacion);
            const completedDate = tarea.fechaFin ? new Date(tarea.fechaFin) : null;

            const weekStart = new Date(assignedDate);
            weekStart.setDate(weekStart.getDate() - weekStart.getDay());
            const weekKey = weekStart.toISOString().split('T')[0];

            if (!taskCompletionOverTime[weekKey]) {
                taskCompletionOverTime[weekKey] = { assigned: 0, completed: 0 };
            }
            taskCompletionOverTime[weekKey].assigned++;

            if (completedDate) {
                const completedWeekStart = new Date(completedDate);
                completedWeekStart.setDate(completedWeekStart.getDate() - completedWeekStart.getDay());
                const completedWeekKey = completedWeekStart.toISOString().split('T')[0];

                if (!taskCompletionOverTime[completedWeekKey]) {
                    taskCompletionOverTime[completedWeekKey] = { assigned: 0, completed: 0 };
                }
                taskCompletionOverTime[completedWeekKey].completed++;

                const completionTime = (completedDate - new Date(tarea.fechaInicio)) / 86400000; // in days
                if (!avgTaskCompletionTimeOverTime[completedWeekKey]) {
                    avgTaskCompletionTimeOverTime[completedWeekKey] = { totalTime: 0, count: 0 };
                }
                avgTaskCompletionTimeOverTime[completedWeekKey].totalTime += completionTime;
                avgTaskCompletionTimeOverTime[completedWeekKey].count++;
            }
        });

        const cumulativeTaskCompletionOverTime = {};
        let cumulativeAssigned = 0;
        let cumulativeCompleted = 0;
        Object.keys(taskCompletionOverTime).sort().forEach((week) => {
            cumulativeAssigned += taskCompletionOverTime[week].assigned;
            cumulativeCompleted += taskCompletionOverTime[week].completed;
            cumulativeTaskCompletionOverTime[week] = { assigned: cumulativeAssigned, completed: cumulativeCompleted };
        });

        const avgTaskCompletionTimeData = {
            labels: Object.keys(avgTaskCompletionTimeOverTime),
            datasets: [
                {
                    label: 'Tiempo Promedio de Finalización (días)',
                    data: Object.values(avgTaskCompletionTimeOverTime).map(t => t.totalTime / t.count),
                    borderColor: '#66BB6A',
                    fill: false,
                }
            ],
        };

        const userProductivityOverTimeData = {
            labels: Object.keys(userProductivityOverTime),
            datasets: Object.keys(tareasByUser).map((userName, index) => ({
                label: userName,
                data: Object.keys(userProductivityOverTime).map(date => userProductivityOverTime[date][userName] || 0),
                borderColor: userColors[index % userColors.length],
                fill: false,
            })),
        };

        const sortedSprintKeys = Object.keys(sprintCompletionTimes).sort((a, b) => {
            const sprintA = parseInt(a.split(' ')[1]);
            const sprintB = parseInt(b.split(' ')[1]);
            return sprintA - sprintB;
        });

        const sprintCompletionTimeData = {
            labels: sortedSprintKeys,
            datasets: [
                {
                    label: 'Tiempo Asignado (días)',
                    data: sortedSprintKeys.map(key => sprintCompletionTimes[key].totalAssignedTime / (sprintCompletionTimes[key].count * 86400000)),
                    backgroundColor: '#FFA726',
                },
                {
                    label: 'Tiempo Real (días)',
                    data: sortedSprintKeys.map(key => sprintCompletionTimes[key].totalActualTime / (sprintCompletionTimes[key].count * 86400000)),
                    backgroundColor: '#66BB6A',
                }
            ],
        };

        const taskCompletionOverTimeData = {
            labels: Object.keys(cumulativeTaskCompletionOverTime),
            datasets: [
                {
                    label: 'Tareas Asignadas',
                    data: Object.values(cumulativeTaskCompletionOverTime).map(t => t.assigned),
                    borderColor: '#FFA726',
                    fill: false,
                },
                {
                    label: 'Tareas Completadas',
                    data: Object.values(cumulativeTaskCompletionOverTime).map(t => t.completed),
                    borderColor: '#66BB6A',
                    fill: false,
                }
            ],
        };

        const userProductivityData = {
            labels: Object.keys(tareasByUser),
            datasets: [
                {
                    label: 'Tiempo Promedio de Finalización (días)',
                    data: Object.values(tareasByUser).map(u => u.totalTime / (u.count * 86400000)),
                    backgroundColor: '#66BB6A',
                }
            ],
        };

        const sprintVelocityData = {
            labels: sortedSprintKeys,
            datasets: [
                {
                    label: 'Puntos Totales Completados',
                    data: sortedSprintKeys.map(key => sprintPoints[key]),
                    backgroundColor: '#66BB6A',
                }
            ],
        };

        setChartData({
            pie: {
                labels: ['Completadas', 'Pendientes'],
                datasets: [{
                    data: [completed, pending],
                    backgroundColor: ['#66BB6A', '#FFA726'],
                    borderColor: ['#43A047', '#FB8C00'],
                    borderWidth: 1,
                }],
            },
            sprintBar: {
                labels: sortedSprintKeys,
                datasets: [
                    {
                        label: 'Completadas',
                        data: sortedSprintKeys.map(key => tareasBySprint[key].completadas),
                        backgroundColor: '#66BB6A',
                    },
                    {
                        label: 'Pendientes',
                        data: sortedSprintKeys.map(key => tareasBySprint[key].pendientes),
                        backgroundColor: '#FFA726',
                    }
                ],
            },
            userBar: {
                labels: Object.keys(tareasByUser),
                datasets: [
                    {
                        label: 'Completadas',
                        data: Object.values(tareasByUser).map(u => u.completadas),
                        backgroundColor: '#66BB6A',
                    },
                    {
                        label: 'Pendientes',
                        data: Object.values(tareasByUser).map(u => u.pendientes),
                        backgroundColor: '#FFA726',
                    }
                ],
            },
            sprintCompletionTime: sprintCompletionTimeData,
            taskCompletionOverTime: taskCompletionOverTimeData,
            avgTaskCompletionTime: avgTaskCompletionTimeData,
            userProductivityOverTime: userProductivityOverTimeData,
            userProductivity: userProductivityData,
            sprintVelocity: sprintVelocityData,
        });

        setLoading(false);
    } catch (error) {
        console.error("Error loading tareas:", error);
        setError(error.toString());
        setLoading(false);
    }
}

async function loadUsersForTasks(tareas) {
    try {
        const uniqueUserIds = [...new Set(tareas.map(tarea => tarea.idusuario))].filter(id => id !== undefined);
        console.log("Unique user IDs:", uniqueUserIds);

        const fetchUserData = async (userId) => {
            try {
                const response = await fetch(`${USERS_API}/${userId}`);
                if (!response.ok) throw new Error(`Failed to fetch user ${userId}`);
                return await response.json();
            } catch (error) {
                console.error(`Error fetching user data for user ID ${userId}:`, error);
            }
        };

        const fetchAllUserData = async () => {
            const userDataArray = await Promise.all(uniqueUserIds.map(id => fetchUserData(id)));
            const userData = userDataArray.filter(data => data);
            console.log("Fetched user data:", userData);
            return userData;
        };

        return await fetchAllUserData();
    } catch (error) {
        console.error("Error loading user data:", error);
        throw error;
    }
}