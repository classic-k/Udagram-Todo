import 'source-map-support/register'
import { TodoItem } from '../models/TodoItem'
import { Todo } from '../todos'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { TodoUpdate } from '../models/TodoUpdate'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import {getUUID} from "./utils"

const todo = new Todo()

export async function getTodos(userId: string): Promise<TodoItem[]> {
    return await todo.getTodos(userId)
}

export async function createTodo(
    createTodoRequest: CreateTodoRequest,
    userId: string
): Promise<TodoItem> {
const {name, dueDate} = createTodoRequest
    const todoId = getUUID()
const createdAt = Date().toString()
    const newTodo: TodoItem = {
        userId: userId,
        todoId: todoId,
        createdAt: createdAt,
        name: name,
        dueDate: dueDate,
        done: false
    }

    
   
    const res = await todo.createTodo(newTodo)
    return res
}

export async function updateTodo(
    userId: string,
    todoId: string,
    updateTodoRequest: UpdateTodoRequest
): Promise<TodoUpdate> {

    const up_todo: TodoUpdate = {
        name: updateTodoRequest.name,
        dueDate: updateTodoRequest.dueDate,
        done: updateTodoRequest.done
    }
const res = await todo.updateTodo(userId, todoId, up_todo)
    return res
}

export async function deleteTodo(userId: string, todoId: string): Promise<Boolean>  {

    const del_todo = todo.deleteTodo(userId, todoId)
    return del_todo
}


export async function genAttachUrl(userId: string, todoId: string):  Promise < String >{
    const url = await todo.saveAttURL(userId, todoId)
    return url
}

