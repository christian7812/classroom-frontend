import * as z from 'zod';

export const facultySchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least two characters'),
  email: z.string().trim().email('Enter a valid email address'),
  role: z.enum(['admin', 'teacher', 'student']),
  department: z.string().trim().min(1, 'Select a department'),
  image: z.string().optional(),
  imageCldPubId: z.string().optional(),
});

export const subjectSchema = z.object({
  code: z.string().trim().min(1, 'Subject code is required').max(50),
  name: z.string().trim().min(1, 'Subject name is required').max(255),
  description: z.string().trim().max(500).default(''),
  departmentId: z.coerce
    .number()
    .int('Select a department')
    .positive('Select a department'),
});

const timeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Enter a time in HH:mm format');

export const scheduleSchema = z
  .object({
    classId: z.coerce.number().int().positive('Select a class'),
    dayOfWeek: z.enum([
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
    ]),
    startTime: timeSchema,
    endTime: timeSchema,
    room: z.string().trim().min(1, 'Room is required').max(100),
  })
  .refine((schedule) => schedule.startTime < schedule.endTime, {
    message: 'End time must be later than start time',
    path: ['endTime'],
  });

export const classSchema = z.object({
  name: z.string().trim().min(1, 'Class name is required').max(255),
  subjectId: z.coerce.number().int().positive('Select a subject'),
  instructorId: z.coerce.number().int().positive('Select an instructor'),
  capacity: z.coerce
    .number()
    .int('Capacity must be a whole number')
    .positive('Capacity must be at least 1'),
  status: z.enum(['active', 'inactive']).default('active'),
  imageUrl: z.string().url('Upload a valid class image').optional(),
  bannerUrl: z.string().url('Upload a valid class banner').optional(),
});

export const enrollmentSchema = z.object({
  studentId: z.coerce.number().int().positive('Select a student'),
  classId: z.coerce.number().int().positive('Select a class'),
  status: z.enum(['enrolled', 'waitlisted', 'withdrawn']).default('enrolled'),
});

export type FacultyFormValues = z.infer<typeof facultySchema>;
export type SubjectFormValues = z.infer<typeof subjectSchema>;
export type ScheduleFormValues = z.infer<typeof scheduleSchema>;
export type ClassFormValues = z.infer<typeof classSchema>;
export type EnrollmentFormValues = z.infer<typeof enrollmentSchema>;
