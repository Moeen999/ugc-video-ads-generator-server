import { Request, Response } from "express";
import * as Sentry from "@sentry/node";
import { prisma } from "../config/prisma.js";
import { v2 as cloudinary } from "cloudinary"
import { GenerateContentConfig, HarmBlockThreshold, HarmCategory } from "@google/genai";
import fs from "fs";
import path from "path";
import ai from "../config/ai.js";

const loadImages = (path: string, mimType: string) => {
    return {
        inlineData: {
            data: fs.readFileSync(path).toString("base64"),
            mimType
        }
    }
}

export const createProject = async (req: Request, res: Response) => {
    let tempProjId: string;
    const { userId } = req.auth();
    let isCreditDeducted = false;
    const { name = "New Project", aspectRatio, userPrompt, productName, productDescription, targetLength = 5 } = req.body;
    const images: any = req.files;
    if (images.length < 2 || !productName) {
        return res.status(400).json({ message: "Please upload at least 2 images." })
    }
    const user = await prisma.user.findUnique({
        where: { id: userId }
    })
    if (!user || user.credits < 5) {
        return res.status(401).json({ message: "Insufficient Credits" });
    } else {
        await prisma.user.update({
            where: { id: userId },
            data: { credits: { decrement: 5 } }
        }).then(() => isCreditDeducted = true)
    }

    try {
        let uploadedImages = await Promise.all(
            images.map(async (img: any) => {
                let res = await cloudinary.uploader.upload(img.path, { resource_type: "image" });
                return res.secure_url;
            })
        )
        const project = await prisma.project.create({
            data: {
                name, userId, productName, productDescription, userPrompt, aspectRatio, targetLength: parseInt(targetLength),
                uploadedImages, isGenerating: true
            }
        })
        tempProjId = project.id;

        const model = "gemeni-3-pro-image-preview";

        const generationConfig: GenerateContentConfig = {
            maxOutputTokens: 32768,
            temperature: 1,
            topP: 0.95,
            responseModalities: ["image"],
            imageConfig: {
                aspectRatio: aspectRatio || "9:16",
                imageSize: "1K"
            },
            safetySettings: [
                {
                    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                    threshold: HarmBlockThreshold.OFF,
                },
                {
                    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                    threshold: HarmBlockThreshold.OFF,
                },
                {
                    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                    threshold: HarmBlockThreshold.OFF,
                },
                {
                    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                    threshold: HarmBlockThreshold.OFF,
                },
            ]
        }

        // image to base64 structure for ai.
        const img1base64 = loadImages(images[0].path, images[0].mimType);
        const img2base64 = loadImages(images[1].path, images[1].mimType);

        const prompt = {
            text: `
            Combine the person and the product into a realistic photo. Make the person naturally hold or use the product.Make lighting, shadows, scale and perspective. Make the person stand in professional studio lighting. Output ecommerce-quality photo realistic imagery. ${userPrompt}
            `
        }

        const response: any = await ai.models.generateContent({
            model,
            contents: [img1base64, img2base64, prompt],
            config: generationConfig
        })
        if (!response?.candidates?.[0]?.content?.parts) {
            throw new Error("Unexpected Response!");
        }

        const parts = response.candidates[0].content.parts;
        let finalBuffer: Buffer | null = null;
        for (const part of parts) {
            if (part.inlineData) {
                finalBuffer = Buffer.from(part.inlineData.data, "base64");
            }
        }
        if (!finalBuffer) {
            throw new Error("Failed to generate the image");
        }

        const base64Img = `data:image/png;base64,${finalBuffer.toString('base64')}`;

        const uploadResult = await cloudinary.uploader.upload(base64Img, { resource_type: "image" });

        await prisma.project.update({
            where: { id: project.id },
            data: {
                generatedImage: uploadResult.secure_url,
                isGenerating: false
            }
        });
        res.json({ projectId: project.id });
    } catch (error: any) {
        if (tempProjId!) {
            await prisma.project.update({
                where: { id: tempProjId },
                data: { isGenerating: false, error: error.message, }
            })
        }

        if (isCreditDeducted) {
            await prisma.user.update({
                where: { id: userId },
                data: { credits: { increment: 5 } }
            })
        }
        Sentry.captureException(error);
        res.status(500).json({ message: error.message });
    }
}

export const createVideo = async (req: Request, res: Response) => {
    try {

    } catch (error: any) {
        Sentry.captureException(error);
        res.status(500).json({ message: error.message });
    }
}

export const getAllPublishedProjects = async (req: Request, res: Response) => {
    try {

    } catch (error: any) {
        Sentry.captureException(error);
        res.status(500).json({ message: error.message });
    }
}

export const deleteProject = async (req: Request, res: Response) => {
    try {

    } catch (error: any) {
        Sentry.captureException(error);
        res.status(500).json({ message: error.message });
    }
}