import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from '@refinedev/react-hook-form';
import { useList, type BaseRecord, type HttpError } from '@refinedev/core';
import { useNavigate } from 'react-router';
import { ArrowLeft, BookOpen, CheckCircle2, GraduationCap, Users } from 'lucide-react';
import { Breadcrumb } from '@/components/refine-ui/layout/breadcrumb';
import { CreateView } from '@/components/refine-ui/views/create-view';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { classSchema } from '@/lib/schema';
import type { Subject } from '@/types';
import type { z } from 'zod';
import Uploadwidgets, { type CloudinaryUploadResult } from '@/components/upload-widgets';

type ClassFormInput = z.input<typeof classSchema>;

type TeacherOption = {
  id: number;
  name: string;
};

const teachers: TeacherOption[] = [
  { id: 1, name: 'Alex Morgan' },
  { id: 2, name: 'Jordan Lee' },
  { id: 3, name: 'Taylor Kim' },
];

const ClassCreate = () => {
  const [validated, setValidated] = useState(false);
  const navigate = useNavigate();
  const {
    result: subjectsResult,
    query: { isLoading: subjectsLoading, isError: subjectsError },
  } = useList<Subject>({
    resource: 'subjects',
    pagination: {
      currentPage: 1,
      pageSize: 100,
    },
  });
  const subjects = subjectsResult.data;
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting },} = useForm<
    BaseRecord,
    HttpError,
    ClassFormInput
  >({
    resolver: zodResolver(classSchema),
    refineCoreProps: {
      resource: 'classes',
      action: 'create',
    },
    defaultValues: {
      name: '',
      capacity: 1,
      status: 'active',
    },

  });

  const onSubmit = handleSubmit(() => {
    setValidated(true);
  });

  return (
    <CreateView className="w-full min-w-0 gap-4 sm:gap-6">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 overflow-x-auto">
          <Breadcrumb />
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate('/classes')}
          className="w-full gap-2 rounded-lg sm:w-auto"
        >
          <ArrowLeft aria-hidden="true" />
          Go back
        </Button>
      </div>

      <section className="relative min-w-0 overflow-hidden rounded-xl border border-primary/20 bg-primary p-4 text-primary-foreground shadow-sm sm:p-6 lg:p-8">
        <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-20 size-64 rounded-full border-32 border-primary-foreground/10" />
        <div className="relative flex min-w-0 items-start gap-3 sm:gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/15 text-primary-foreground ring-1 ring-primary-foreground/20 sm:size-12">
            <GraduationCap aria-hidden="true" className="size-6" />
          </div>
          <div className="min-w-0 space-y-2">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary-foreground/80">
              Classroom management
            </p>
            <h1 className="wrap-break-word text-2xl font-bold tracking-tight sm:text-3xl">
              Create a class
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-primary-foreground/85 sm:text-base">
              Bring a subject, instructor, and students together in one place.
              Add the class details below to get started.
            </p>
          </div>
        </div>
      </section>

      <div className="grid w-full min-w-0 items-start gap-4 sm:gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
        <form
          onSubmit={onSubmit}
          noValidate
          className="w-full min-w-0 space-y-6 rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm sm:space-y-7 sm:p-6 lg:p-7"
        >
          <div className="space-y-1 border-b border-border pb-5">
            <h2 className="text-lg font-semibold">Class details</h2>
            <p className="text-sm text-muted-foreground">
              Complete each field. You can change these details later.
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-foreground">
              Class name <span className="text-destructive">*</span>
            </label>
            <Input
              id="name"
              placeholder="e.g. Computer Science 101"
              className="h-11 border-2 border-foreground/25 bg-background text-foreground shadow-sm placeholder:text-muted-foreground hover:border-foreground/40 focus-visible:border-primary focus-visible:ring-primary/20"
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? 'name-error' : 'name-hint'}
              {...register('name')}
            />
            {errors.name ? (
              <p id="name-error" className="text-sm text-destructive">{errors.name.message}</p>
            ) : (
              <p id="name-hint" className="text-sm text-muted-foreground">
                Choose a clear name students will recognize.
              </p>
            )}
          </div>

          <div className="grid min-w-0 gap-5 lg:grid-cols-2 lg:gap-6">
            <div className="min-w-0 space-y-2">
              <label htmlFor="subjectId" className="text-sm font-medium text-foreground">
                Subject <span className="text-destructive">*</span>
              </label>
              <select
                id="subjectId"
                className="h-11 w-full min-w-0 rounded-md border-2 border-foreground/25 bg-background px-3 text-sm text-foreground shadow-sm transition-colors hover:border-foreground/40 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/20 aria-invalid:border-destructive disabled:cursor-not-allowed disabled:opacity-50"
                disabled={subjectsLoading || subjectsError || subjects.length === 0}
                aria-invalid={Boolean(errors.subjectId)}
                aria-describedby={errors.subjectId ? 'subject-error' : 'subject-hint'}
                {...register('subjectId', { valueAsNumber: true })}
              >
                <option value="">
                  {subjectsLoading ? 'Loading subjects...' : 'Choose a subject'}
                </option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.code} — {subject.name}
                  </option>
                ))}
              </select>
              {errors.subjectId ? (
                <p id="subject-error" className="text-sm text-destructive">{errors.subjectId.message}</p>
              ) : subjectsError ? (
                <p id="subject-hint" className="text-sm text-destructive">
                  Could not load subjects. Please try again later.
                </p>
              ) : subjects.length === 0 && !subjectsLoading ? (
                <p id="subject-hint" className="text-sm text-muted-foreground">
                  No subjects are available yet. Add a subject before creating a class.
                </p>
              ) : (
                <p id="subject-hint" className="text-sm text-muted-foreground">
                  Select the subject this class will teach.
                </p>
              )}
            </div>

            <div className="min-w-0 space-y-2">
              <label htmlFor="instructorId" className="text-sm font-medium text-foreground">
                Teacher <span className="text-destructive">*</span>
              </label>
              <select
                id="instructorId"
                className="h-11 w-full min-w-0 rounded-md border-2 border-foreground/25 bg-background px-3 text-sm text-foreground shadow-sm transition-colors hover:border-foreground/40 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/20 aria-invalid:border-destructive"
                aria-invalid={Boolean(errors.instructorId)}
                aria-describedby={errors.instructorId ? 'instructor-error' : 'instructor-hint'}
                {...register('instructorId', { valueAsNumber: true })}
              >
                <option value="">Choose a teacher</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </option>
                ))}
              </select>
              {errors.instructorId ? (
                <p id="instructor-error" className="text-sm text-destructive">{errors.instructorId.message}</p>
              ) : (
                <p id="instructor-hint" className="text-sm text-muted-foreground">
                  Choose from the temporary teacher list.
                </p>
              )}
            </div>
          </div>

          <div className="grid min-w-0 gap-5 lg:grid-cols-2 lg:gap-6">
            <div className="min-w-0 space-y-2">
              <label htmlFor="capacity" className="text-sm font-medium text-foreground">
                Student capacity <span className="text-destructive">*</span>
              </label>
              <Input
                id="capacity"
                type="number"
                min="1"
                step="1"
                className="h-11 border-2 border-foreground/25 bg-background text-foreground shadow-sm hover:border-foreground/40 focus-visible:border-primary focus-visible:ring-primary/20"
                aria-invalid={Boolean(errors.capacity)}
                aria-describedby={errors.capacity ? 'capacity-error' : 'capacity-hint'}
                {...register('capacity')}
              />
              {errors.capacity ? (
                <p id="capacity-error" className="text-sm text-destructive">{errors.capacity.message}</p>
              ) : (
                <p id="capacity-hint" className="text-sm text-muted-foreground">
                  Maximum number of students for this class.
                </p>
              )}
            </div>

            <div className="min-w-0 space-y-2">
              <label htmlFor="status" className="text-sm font-medium text-foreground">
                Status <span className="text-destructive">*</span>
              </label>
              <select
                id="status"
                className="h-11 w-full min-w-0 rounded-md border-2 border-foreground/25 bg-background px-3 text-sm text-foreground shadow-sm transition-colors hover:border-foreground/40 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/20"
                aria-describedby="status-hint"
                {...register('status')}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <p id="status-hint" className="text-sm text-muted-foreground">
                Choose whether this class is currently available.
              </p>
            </div>
          </div>

          <div className="grid min-w-0 gap-5 border-t border-border pt-6 lg:grid-cols-2 lg:gap-6">
            <Uploadwidgets
              id="classImage"
              label="Class image"
              hint="Optional. PNG, JPG, or WebP; up to 3 MB."
              folder="classes/images"
              onUploadComplete={(result: CloudinaryUploadResult | null) => {
                setValue('imageUrl', result?.secure_url);
              }}
            />
            <Uploadwidgets
              id="classBanner"
              label="Class banner"
              hint="Optional. A wide image works best; PNG, JPG, or WebP up to 3 MB."
              folder="classes/banners"
              onUploadComplete={(result: CloudinaryUploadResult | null) => {
                setValue('bannerUrl', result?.secure_url);
              }}
            />
          </div>

          {validated && (
            <div role="status" className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm">
              <CheckCircle2 aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
              <p className="text-foreground">
                Details look good. Image files are uploaded to Cloudinary; saving class details is not connected to the backend yet.
              </p>
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => navigate('/classes')} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="w-full sm:min-w-44 sm:w-auto">
              Create Class
            </Button>
          </div>
        </form>

        <aside className="w-full min-w-0 rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm sm:p-6">
          <h2 className="text-base font-semibold">A quick checklist</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            You’ll need these details to set up a class.
          </p>
          <ul className="mt-5 space-y-4">
            <li className="flex gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <BookOpen aria-hidden="true" className="size-4" />
              </span>
              <span className="text-sm text-foreground">Link it to an existing subject.</span>
            </li>
            <li className="flex gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <GraduationCap aria-hidden="true" className="size-4" />
              </span>
              <span className="text-sm text-foreground">Assign an instructor to lead it.</span>
            </li>
            <li className="flex gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Users aria-hidden="true" className="size-4" />
              </span>
              <span className="text-sm text-foreground">Set a capacity for your students.</span>
            </li>
          </ul>
          <p className="mt-6 rounded-lg bg-muted p-3 text-xs leading-relaxed text-muted-foreground">
            Subjects are loaded from the backend. Teacher options are temporary sample data until the faculty API is connected.
          </p>
        </aside>
      </div>
    </CreateView>
  );
};

export default ClassCreate;
