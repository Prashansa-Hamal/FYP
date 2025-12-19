"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useController, useForm } from "react-hook-form";
import * as z from "zod";
import CreatableSelect from "react-select/creatable";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Flame,
  Leaf,
  Wine,
  Clock,
  DollarSign,
  Hash,
  ChefHat,
  List,
  Tag,
  Utensils,
  Thermometer,
  Zap,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { menuItemFormSchema } from "@/schemas";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { ImageInput } from "@/components/demo-components/demo-image-input";
import { useCreateMenuItem } from "@/hooks/useMenuItems";
import { useRouter } from "next/navigation";

// Zod schema
type FormValues = z.infer<typeof menuItemFormSchema>;

const categoryOptions = [
  { value: "APPETIZER", label: "Appetizer" },
  { value: "MAIN_COURSE", label: "Main Course" },
  { value: "DESSERT", label: "Dessert" },
  { value: "BEVERAGE", label: "Beverage" },
  { value: "ALCOHOLIC", label: "Alcoholic" },
  { value: "SNACK", label: "Snack" },
  { value: "SIDE_DISH", label: "Side Dish" },
];

const preparationStationOptions = [
  { value: "KITCHEN", label: "Kitchen" },
  { value: "BAR", label: "Bar" },
  { value: "DESSERT_STATION", label: "Dessert Station" },
  { value: "FRY_STATION", label: "Fry Station" },
  { value: "GRILL_STATION", label: "Grill Station" },
];

export default function MenuItemForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(menuItemFormSchema),
    defaultValues: {
      name: "",
      category: "" as any,
      preparationStation: "" as any,
      isVegetarian: false,
      isAlcoholic: false,
      isSpicy: false,
      description: "",
      price: 0,
      calories: 0,
      preparationTime: 0,
      ingredients: [],
      tags: [],
      imageUrl: "",
    },
  });

  const router = useRouter();
  const createMutation = useCreateMenuItem();

  async function onSubmit(values: FormValues) {
    console.log(values);

    try {
      await createMutation.mutateAsync({
        ...values,
        ingredients: values.ingredients,
        tags: values.tags,
        price: parseFloat(values.price as any),
        preparationTime: parseInt(values.preparationTime as any),
      });

      router.push("/menu-items");
    } catch (error) {
      console.error("Failed to create menu item:", error);
    }
  }

  return (
    <div className="w-full">
      <Card className="border py-2 sm:py-4 shadow-lg max-w-6xl mx-auto">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="text-xl sm:text-2xl font-bold text-primary">
            Create Menu Item
          </CardTitle>
          <CardDescription className="text-muted-foreground text-sm sm:text-base">
            Add a new menu item with all the necessary details for your
            restaurant menu
          </CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="px-4 sm:px-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 sm:space-y-8"
            >
              {/* Basic Information Section */}
              <section className="space-y-3 sm:space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10">
                    <ChefHat className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold">
                      Basic Information
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Essential details about the menu item
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {/* Name */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-full lg:col-span-1">
                        <FormLabel className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                          <Hash className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          <span>Item Name *</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Caesar Salad"
                            {...field}
                            className="h-10 sm:h-11 bg-background text-base"
                          />
                        </FormControl>
                        <FormMessage className="text-xs sm:text-sm" />
                      </FormItem>
                    )}
                  />

                  {/* Category */}
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-1">
                        <FormLabel className="text-sm font-medium text-gray-700">
                          Category *
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-10 sm:h-11 bg-background text-sm sm:text-base">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="text-sm sm:text-base">
                            {categoryOptions.map((category) => (
                              <SelectItem
                                key={category.value}
                                value={category.value}
                                className="text-sm sm:text-base"
                              >
                                {category.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-xs sm:text-sm" />
                      </FormItem>
                    )}
                  />

                  {/* Preparation Station */}
                  <FormField
                    control={form.control}
                    name="preparationStation"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-1">
                        <FormLabel className="text-sm font-medium text-gray-700">
                          Preparation Station *
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-10 sm:h-11 bg-background text-sm sm:text-base">
                              <SelectValue placeholder="Select station" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="text-sm sm:text-base">
                            {preparationStationOptions.map((station) => (
                              <SelectItem
                                key={station.value}
                                value={station.value}
                                className="text-sm sm:text-base"
                              >
                                {station.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-xs sm:text-sm" />
                      </FormItem>
                    )}
                  />

                  {/* Price */}
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">
                          Price
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              {...field}
                              className="h-10 sm:h-11 bg-background pl-12 text-base"
                              value={field.value || ""}
                              onChange={(e) => {
                                const value = e.target.value;
                                const numericValue = Number(value);
                                field.onChange(
                                  isNaN(numericValue) ? "" : numericValue
                                );
                              }}
                            />
                            <div className="absolute left-3 bottom-1/2 transform translate-y-1/2 text-muted-foreground text-sm">
                              NPR
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs sm:text-sm" />
                      </FormItem>
                    )}
                  />

                  {/* Preparation Time */}
                  <FormField
                    control={form.control}
                    name="preparationTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          <span>Prep Time (min)</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="h-10 sm:h-11 bg-background text-base"
                            value={field.value || ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              const numericValue = Number(value);
                              field.onChange(
                                isNaN(numericValue) ? "" : numericValue
                              );
                            }}
                          />
                        </FormControl>
                        <FormMessage className="text-xs sm:text-sm" />
                      </FormItem>
                    )}
                  />

                  {/* Calories */}
                  <FormField
                    control={form.control}
                    name="calories"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                          <Thermometer className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          <span>Calories</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="h-10 sm:h-11 bg-background text-base"
                            value={field.value || ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              const numericValue = Number(value);
                              field.onChange(
                                isNaN(numericValue) ? "" : numericValue
                              );
                            }}
                          />
                        </FormControl>
                        <FormMessage className="text-xs sm:text-sm" />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Description
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your menu item... Include key ingredients, flavor profile, and serving suggestions."
                          className="min-h-[120px] resize-none bg-background text-base"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <div className="flex justify-between items-center">
                        <FormMessage className="text-xs sm:text-sm" />
                        <div className="text-xs text-muted-foreground">
                          {field.value?.length || 0}/500
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
              </section>

              <Separator />

              {/* Dietary Features Section */}
              <section className="space-y-4 sm:space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-green-500/10">
                    <Utensils className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold">
                      Dietary & Features
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Select dietary preferences and special features
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="isVegetarian"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={(checked) =>
                                field.onChange(checked as boolean)
                              }
                              className="sr-only"
                              id="isVegetarian"
                            />
                            <Label
                              htmlFor="isVegetarian"
                              className={`flex sm:flex-col px-6 py-3 sm:p-3 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                                field.value
                                  ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                                  : "border-border hover:border-green-300 hover:bg-accent/50"
                              }`}
                            >
                              <div className="flex items-center gap-2 sm:gap-3">
                                <div
                                  className={`p-2 rounded-lg ${
                                    field.value ? "bg-green-500" : "bg-muted"
                                  }`}
                                >
                                  <Leaf
                                    className={`w-4 h-4 sm:w-5 sm:h-5 ${
                                      field.value
                                        ? "text-white"
                                        : "text-muted-foreground"
                                    }`}
                                  />
                                </div>
                                <div className="text-left">
                                  <span className="font-semibold text-sm sm:text-base">
                                    Vegetarian
                                  </span>
                                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                                    Suitable for vegetarians
                                  </p>
                                </div>
                              </div>
                            </Label>
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs sm:text-sm" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isSpicy"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={(checked) =>
                                field.onChange(checked as boolean)
                              }
                              className="sr-only"
                              id="isSpicy"
                            />
                            <Label
                              htmlFor="isSpicy"
                              className={`flex sm:flex-col px-6 py-3 sm:p-3 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                                field.value
                                  ? "border-red-500 bg-red-50 dark:bg-red-950/20"
                                  : "border-border hover:border-red-300 hover:bg-accent/50"
                              }`}
                            >
                              <div className="flex items-center gap-2 sm:gap-3">
                                <div
                                  className={`p-2 rounded-lg ${
                                    field.value ? "bg-red-500" : "bg-muted"
                                  }`}
                                >
                                  <Flame
                                    className={`w-4 h-4 sm:w-5 sm:h-5 ${
                                      field.value
                                        ? "text-white"
                                        : "text-muted-foreground"
                                    }`}
                                  />
                                </div>
                                <div className="text-left">
                                  <span className="font-semibold text-sm sm:text-base">
                                    Spicy
                                  </span>
                                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                                    Contains spicy ingredients
                                  </p>
                                </div>
                              </div>
                            </Label>
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs sm:text-sm" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isAlcoholic"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={(checked) =>
                                field.onChange(checked as boolean)
                              }
                              className="sr-only"
                              id="isAlcoholic"
                            />
                            <Label
                              htmlFor="isAlcoholic"
                              className={`flex sm:flex-col px-6 py-3 sm:p-3 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                                field.value
                                  ? "border-amber-500 bg-amber-50 dark:bg-amber-950/20"
                                  : "border-border hover:border-amber-300 hover:bg-accent/50"
                              }`}
                            >
                              <div className="flex items-center gap-2 sm:gap-3">
                                <div
                                  className={`p-2 rounded-lg ${
                                    field.value ? "bg-amber-500" : "bg-muted"
                                  }`}
                                >
                                  <Wine
                                    className={`w-4 h-4 sm:w-5 sm:h-5 ${
                                      field.value
                                        ? "text-white"
                                        : "text-muted-foreground"
                                    }`}
                                  />
                                </div>
                                <div className="text-left">
                                  <span className="font-semibold text-sm sm:text-base">
                                    Alcoholic
                                  </span>
                                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                                    Contains alcohol
                                  </p>
                                </div>
                              </div>
                            </Label>
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs sm:text-sm" />
                      </FormItem>
                    )}
                  />
                </div>
              </section>

              <Separator />

              {/* Ingredients and Tags Section */}
              <section className="space-y-4 sm:space-y-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-blue-500/10">
                    <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold">
                      Ingredients & Tags
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Add ingredients and categorize your item
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:gap-8 lg:grid-cols-2">
                  {/* Ingredients */}
                  <FormField
                    control={form.control}
                    name="ingredients"
                    render={() => {
                      const {
                        field: { onChange, value, ref },
                        fieldState: { error },
                      } = useController({
                        name: "ingredients",
                        control: form.control,
                      });

                      const handleSelectChange = (selectedOptions: any) => {
                        const ingredients = selectedOptions.map(
                          (option: any) => option.value
                        );
                        onChange(ingredients);
                      };

                      return (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                            <List className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span>Ingredients</span>
                          </FormLabel>
                          <FormControl>
                            <CreatableSelect
                              ref={ref}
                              id="ingredients-select"
                              isMulti
                              value={value.map((val: string) => ({
                                value: val,
                                label: val,
                              }))}
                              onChange={handleSelectChange}
                              placeholder="Type ingredient and press Enter..."
                              className="react-select-container"
                              classNamePrefix="react-select"
                              styles={{
                                control: (base) => ({
                                  ...base,
                                  minHeight: "44px",
                                  borderColor: "hsl(var(--input))",
                                  backgroundColor: "hsl(var(--background))",
                                  fontSize: "14px",
                                  "&:hover": {
                                    borderColor: "hsl(var(--primary))",
                                  },
                                }),
                                multiValue: (base) => ({
                                  ...base,
                                  backgroundColor: "hsl(var(--secondary))",
                                  fontSize: "13px",
                                }),
                                placeholder: (base) => ({
                                  ...base,
                                  fontSize: "16px",
                                }),
                                input: (base) => ({
                                  ...base,
                                  fontSize: "16px",
                                }),
                                menu: (base) => ({
                                  ...base,
                                  fontSize: "16px",
                                }),
                              }}
                            />
                          </FormControl>
                          {error && (
                            <FormMessage className="text-xs sm:text-sm">
                              {error.message}
                            </FormMessage>
                          )}
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            Press Enter or comma to add multiple ingredients
                          </p>
                        </FormItem>
                      );
                    }}
                  />

                  {/* Tags */}
                  <FormField
                    control={form.control}
                    name="tags"
                    render={() => {
                      const {
                        field: { onChange, value, ref },
                        fieldState: { error },
                      } = useController({
                        name: "tags",
                        control: form.control,
                      });

                      const handleSelectChange = (selectedOptions: any) => {
                        const tags = selectedOptions.map(
                          (option: any) => option.value
                        );
                        onChange(tags);
                      };

                      return (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                            <Tag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span>Tags</span>
                          </FormLabel>
                          <FormControl>
                            <CreatableSelect
                              ref={ref}
                              id="tags-select"
                              isMulti
                              value={value.map((val: string) => ({
                                value: val,
                                label: val,
                              }))}
                              onChange={handleSelectChange}
                              placeholder="Add tags like 'Popular', 'Seasonal'..."
                              className="react-select-container"
                              classNamePrefix="react-select"
                              styles={{
                                control: (base) => ({
                                  ...base,
                                  minHeight: "44px",
                                  borderColor: "hsl(var(--input))",
                                  backgroundColor: "hsl(var(--background))",
                                  fontSize: "14px",
                                  "&:hover": {
                                    borderColor: "hsl(var(--primary))",
                                  },
                                }),
                                multiValue: (base) => ({
                                  ...base,
                                  backgroundColor: "hsl(var(--secondary))",
                                  fontSize: "16px",
                                }),
                                placeholder: (base) => ({
                                  ...base,
                                  fontSize: "16px",
                                }),
                                input: (base) => ({
                                  ...base,
                                  fontSize: "16px",
                                }),
                                menu: (base) => ({
                                  ...base,
                                  fontSize: "16px",
                                }),
                              }}
                            />
                          </FormControl>
                          {error && (
                            <FormMessage className="text-xs sm:text-sm">
                              {error.message}
                            </FormMessage>
                          )}
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            Tags help customers find your item easily
                          </p>
                        </FormItem>
                      );
                    }}
                  />
                </div>
              </section>

              <Separator />

              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Image
                    </FormLabel>
                    <FormControl>
                      <ImageInput
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <Separator />

              {/* Submit Button */}
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 pt-4 sm:pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => form.reset()}
                  className="h-10 sm:h-11 w-full sm:w-auto text-sm sm:text-base"
                >
                  Clear Form
                </Button>
                <Button
                  type="submit"
                  className="h-10 sm:h-11   transition-all duration-200 shadow-md hover:shadow-lg w-full sm:w-auto bg-gradient-to-r text-sm sm:text-base from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Create Menu Item
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
