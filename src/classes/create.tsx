import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { CreateView } from "@/components/refine-ui/views/create-view";
import UploadWidget from "@/components/upload-widget";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CLASS_SUBJECTS, CLASS_TEACHERS } from "@/constants";
import { classSchema } from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useBack } from "@refinedev/core";
import { useForm } from "react-hook-form";
import * as z from "zod";

type ClassFormValues = z.infer<typeof classSchema>;

const Create = () => {
  const back = useBack();
  const form = useForm<ClassFormValues>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      name: "",
      subjectId: 0,
      facultyId: 0,
      status: "active",
      description: "",
      capacity: undefined,
      bannerImage: undefined,
      bannerImageCldPubId: "",
    },
  });

  const onSubmit = (data: ClassFormValues) => {
    console.log(data);
  };

  return (
    <CreateView className="gap-6">
      <Breadcrumb />

      <header className="flex flex-col gap-2">
        <p className="text-sm font-medium text-primary">Class management</p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Create a class
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          Provide the required information below to add a class.
        </p>
      </header>

      <div className="flex justify-end">
        <Button type="button" variant="outline" onClick={back}>
          Go back
        </Button>
      </div>

      <Card className="mx-auto w-full max-w-4xl overflow-hidden">
        <CardHeader className="border-b bg-muted/20 px-5 py-4 sm:px-6">
          <CardTitle>Class details</CardTitle>
          <CardDescription>
            Add a banner, name, subject, and teacher for this class.
          </CardDescription>
        </CardHeader>

        <CardContent className="px-5 py-5 sm:px-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="bannerImageCldPubId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Banner image</FormLabel>
                    <FormControl>
                      <UploadWidget
                        value={form.watch("bannerImage") ?? undefined}
                        onChange={(imageUrl) =>
                          form.setValue("bannerImage", imageUrl, {
                            shouldDirty: true,
                            shouldValidate: true,
                          })
                        }
                        onPublicIdChange={field.onChange}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional. Upload an image for the class; it will be stored
                      in Cloudinary.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Class name <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. CS101 - INTRO TO CS" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-5 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="subjectId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Subject <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select
                        value={field.value ? String(field.value) : ""}
                        onValueChange={(value) => field.onChange(Number(value))}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a subject" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CLASS_SUBJECTS.map((subject) => (
                            <SelectItem
                              key={subject.id}
                              value={String(subject.id)}
                            >
                              {subject.code} · {subject.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="facultyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Teacher <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select
                        value={field.value ? String(field.value) : ""}
                        onValueChange={(value) => field.onChange(Number(value))}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a teacher" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CLASS_TEACHERS.map((teacher) => (
                            <SelectItem
                              key={teacher.id}
                              value={String(teacher.id)}
                            >
                              {teacher.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacity</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          step={1}
                          placeholder="Enter class capacity"
                          value={field.value ?? ""}
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                          onChange={(event) => {
                            const value = event.target.value;
                            field.onChange(value ? Number(value) : undefined);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Status <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Brief description about the class"
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="border-t pt-4">
                <Button
                  type="submit"
                  className="w-full"
                >
                  Create class
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </CreateView>
  );
};

export default Create;
