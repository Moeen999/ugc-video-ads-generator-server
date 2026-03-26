import { Request, Response } from "express";
import * as Sentry from "@sentry/node"
import { prisma } from "../config/prisma.js";
// get user credits
export const getUserCredits = async (req: Request, res: Response) => {
    try {
        const { userId } = req.auth();
        if (!userId) { return res.status(401).json({ message: "Un-Authorized" }) };
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        res.json({ credits: user?.credits });
    } catch (error: any) {
        Sentry.captureException(error);
        res.status(500).json({ message: error.code || error.message });
    }
}

// get all user projects
export const getAllUserProjects = async (req: Request, res: Response) => {
    try {
        const { userId } = req.auth();
        const projects = await prisma.project.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" }
        });

        res.json({ projects });
    } catch (error: any) {
        Sentry.captureException(error);
        res.status(500).json({ message: error.code || error.message });
    }
}

// get projects by id
export const getProjectById = async (req: Request, res: Response) => {
    try {
        const { userId } = req.auth();
        const projectId = req.params.projectId as string;
        const project = await prisma.project.findUnique({
            where: { id: projectId, userId },
        });
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }
        res.json({ project });
    } catch (error: any) {
        Sentry.captureException(error);
        res.status(500).json({ message: error.code || error.message });
    }
}

// publish/unpublish project controller
export const togglePublish = async (req: Request, res: Response) => {
    try {
        const { userId } = req.auth();
        const projectId = req.params.projectId as string;
        const project = await prisma.project.findUnique({
            where: { id: projectId, userId },
        });
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }
        if (!project.generatedImage && !project.generatedVideo) {
            return res.status(404).json({ message: "Image or Video not found" });
        }

        await prisma.project.update({
            where: { id: projectId },
            data: { isPublished: !project.isPublished }
        })

        res.json({ isPublished: !project.isPublished })
    } catch (error: any) {
        Sentry.captureException(error);
        res.status(500).json({ message: error.code || error.message });
    }
}