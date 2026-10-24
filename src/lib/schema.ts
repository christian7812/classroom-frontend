import * as z from 'zod'

export const facultySchema = z.object({
    name: z.string().min(2, 'Name must be atleast 2 characters'),
    email: z.string().email(),
    role: z.enum(['admin', 'teacher', 'student']),
    department: z.string(),
    image: z.string().optional(),
    imageCldPubId: z.string().optional(), 
})

export const classSchema = z.object({
    name: z.string().trim().min(2, 'Class name must be at least 2 characters'),
    subjectId: z.number().int().positive(),
    facultyId: z.number().int().positive(),
    capacity: z.number().int().positive().optional(),
    status: z.enum(['active', 'inactive']),
    description: z.string().optional(),
    bannerImage: z.string().url('Enter a valid banner image URL').optional(),
    bannerImageCldPubId: z.string().optional(),
})

export const subjectSchema = z.object({
    name: z.string().trim().min(2, 'Subject name must be at least 2 characters'),
    code: z.string().trim().min(1, 'Subject code is required'),
    description: z.string().optional(),
    departmentId: z.number().int().positive(),
})

export const scheduleSchema = z.object({
    classId: z.number().int().positive(),
    dayOfWeek: z.enum([
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
        'sunday',
    ]),
    startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Enter a valid start time'),
    endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Enter a valid end time'),
    room: z.string().trim().min(1, 'Room is required'),
}).refine((schedule) => schedule.endTime > schedule.startTime, {
    message: 'End time must be later than start time',
    path: ['endTime'],
})

export const enrollmentSchema = z.object({
    studentId: z.number().int().positive(),
    classId: z.number().int().positive(),
    enrollmentDate: z.string().optional(),
    status: z.enum(['enrolled', 'waitlisted', 'dropped']),
})