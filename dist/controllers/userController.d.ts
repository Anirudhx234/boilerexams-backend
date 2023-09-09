import { Request, Response } from 'express';
declare const getAllUsers: (req: Request, res: Response) => Promise<void>;
declare const getUserMe: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
declare const getUser: (req: Request, res: Response) => Promise<void>;
declare const updateUserRole: (req: Request, res: Response) => Promise<void>;
declare const assignUserCourses: (req: Request, res: Response) => Promise<void>;
declare const deleteUser: (req: Request, res: Response) => Promise<void>;
export { getAllUsers, getUserMe, getUser, updateUserRole, assignUserCourses, deleteUser };
