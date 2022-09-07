import { Request, Response } from 'express';

import * as noteService from '../services/noteService';

export async function getAllNotes(req: Request, res: Response) {
    const { userId: ownerId } = res.locals;

    const notes = await noteService.getAllNotes(Number(ownerId));

    res.status(200).send(notes);
}

export async function getNoteById() {
    //
}
export async function createNote(req: Request, res: Response) {
    const { userId: ownerId } = res.locals;
    const { title, note } = req.body;

    await noteService.createNote({ ownerId: Number(ownerId), title, note });

    res.status(201).send();
}
export async function deleteNote() {
    //
}
