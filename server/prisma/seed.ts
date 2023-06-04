const { PrismaClient, Season } = require('@prisma/client')
const express_seed = require('express');

const prisma = new PrismaClient();
const app = express_seed();

async function main() {
    const semester = await prisma.semester.create({
        data: {
            season: Season.SPRING,
            year: 2019
        }
    })
    const course = await prisma.course.create({
        data: {
            name: 'Multivariate Calculus',
            subject: 'MA',
            number: 261,
            semesters: {
                connect: {
                    id: semester.id
                }
            }
        }
    })
    const exam = await prisma.exam.create({
        data: {
            courseId: course.id,
            semesterId: semester.id,
            number: 1,
            semesters: {
                connect: {
                    id: semester.id
                }
            },
            questions: {
                create: [{
                    courseId: course.id,
                    number: 1,
                    body: "A line \\(l\\) passes through the point \\(-1,1,2\\) and is perpendicular to the plane \\(x-2y+2z=8\\). At what point does this line intersect with the \\(yz\\)-plane?",
                    answerChoices: ['\\(0,4,6\\)', '\\(0,3,1\\)', '\\(0,4,-1\\)', '\\(0,1,4\\)', '\\(0,-1,4\\)'],
                    correctChoiceIndex: 4,
                    solutionVideoLink: "https://youtu.be/TA9-ezOW78k?t=10",
                },
                {
                    courseId: course.id,
                    number: 2,
                    body: "Find the equation of the plane that passes through the point \\(1,-1,2\\) and is perpendicular to both the planes \\(2x+y-2z=1\\) and \\(x+3z=10\\).",
                    answerChoices: ['\\(3x+8y-z=-7\\)', '\\(3x-8y-z=9\\)', '\\(3x-8y+z=13\\)', '\\(3x-8y-z=13\\)', '\\(3x-y+z=10\\)'],
                    correctChoiceIndex: 1,
                    solutionVideoLink: "https://youtu.be/TA9-ezOW78k?t=161",
                },
                {
                    courseId: course.id,
                    number: 3,
                    body: 'Find a vector function that represents the curve of intersection of the cylinder \\( y^{2}+z^{2}=1 \\) and the plane \\( x+y+2 z=3 \\).',
                    answerChoices: ['\\( \\mathbf{r}(t)=<3-\\cos t-\\sin t, \\cos t, \\sin t>, \\quad 0 \\leq t \\leq 2 \\pi \\)', '\\( \\mathbf{r}(t)=<3-\\cos t-2 \\sin t, \\cos t, \\sin t>, \\quad 0 \\leq t \\leq 2 \\pi \\)', '\\( \\mathbf{r}(t)=<1-\\cos t-2 \\sin t, \\cos t, \\sin t>, \\quad 0 \\leq t \\leq 2 \\pi \\)', '\\( \\mathbf{r}(t)=<3-\\cos t-\\sin t, 2 \\cos t, \\sin t>, \\quad 0 \\leq t \\leq 2 \\pi \\)', '\\( \\mathbf{r}(t)=<3-\\cos t-2 \\sin t, \\cos t, 2 \\sin t>, \\quad 0 \\leq t \\leq 2 \\pi \\)'],
                    correctChoiceIndex: 1,
                    solutionVideoLink: 'https://youtu.be/TA9-ezOW78k?t=294',
                },
                {
                    courseId: course.id,
                    number: 4,
                    body: 'Let \\( \\mathbf{r}(t)=\\left\\langle t, \\frac{1}{2} t^{2}, \\frac{1}{3} t^{3}\\right\\rangle \\), find \\( \\kappa(1) \\) (namely, the curvature at \\( \\mathrm{t}=1 \\)).',
                    answerChoices: ['\\(1\\)', '\\( \\frac{1}{3} \\)', '\\( \\frac{\\sqrt{2}}{3} \\)', '\\( \\frac{-1}{3} \\)', '\\( \\frac{\\sqrt{3}}{3} \\)'],
                    correctChoiceIndex: 2,
                    solutionVideoLink: 'https://youtu.be/TA9-ezOW78k?t=490',
                }
                ]
            }
        },
    })
}

main()
export {}