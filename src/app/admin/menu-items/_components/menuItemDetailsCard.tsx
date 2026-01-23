"use client";

import { useState, useEffect } from "react";
import {
  useDeleteMenuItem,
  useMenuItemDetail,
  useToggleMenuItemAvailability,
  useUpdateMenuItem,
} from "@/hooks/useMenuItems";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Edit,
  Trash2,
  MoreVertical,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  Flame,
  Leaf,
  Wine,
  Tag,
  Package,
  BarChart3,
  Copy,
  Eye,
  EyeOff,
  Save,
  Upload,
  AlertTriangle,
  Info,
  Power,
  Thermometer,
  List,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { MenuItemAdminSkeleton } from "@/components/skeletons/menuItemSkeleton";
import { formatCurrency, formatNumber } from "@/lib/formatters";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useController, useForm } from "react-hook-form";
import {
  categoryOptions,
  FormValues,
  preparationStationOptions,
} from "@/app/admin/menu-items/_components/menu-item-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { menuItemFormSchema } from "@/schemas";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import CreatableSelect from "react-select/creatable";
import { ImageInput } from "@/components/demo-components/demo-image-input";

interface MenuItemDetaisCardProps {
  id: string;
}

export default function MenuItemDetaisCard({ id }: MenuItemDetaisCardProps) {
  const router = useRouter();
  const { data: menuItem, isLoading, error, refetch } = useMenuItemDetail(id);
  const deleteMutation = useDeleteMenuItem();
  const toggleMutation = useToggleMenuItemAvailability();
  const updateMutation = useUpdateMenuItem();

  // State management
  const [isEditing, setIsEditing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Alert dialog states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showToggleDialog, setShowToggleDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

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

  // Initialize data
  useEffect(() => {
    if (menuItem && !isEditing && !hasUnsavedChanges) {
      form.reset({
        name: menuItem.name,
        category: menuItem.category,
        preparationStation: menuItem.preparationStation,
        isVegetarian: menuItem.isVegetarian,
        isAlcoholic: menuItem.isAlcoholic,
        isSpicy: menuItem.isSpicy,
        description: menuItem.description,
        price: menuItem.price,
        calories: menuItem.calories ?? 0,
        preparationTime: menuItem.preparationTime,
        ingredients: menuItem.ingredients,
        tags: menuItem.tags,
        imageUrl: menuItem.imageUrl,
      });
    }
  }, [menuItem, isEditing, hasUnsavedChanges, form]);

  const { isDirty } = form.formState;

  // Check for unsaved changes
  useEffect(() => {
    setHasUnsavedChanges(isDirty);
  }, [isDirty]);

  // Prevent form submission on Enter when not in edit mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !isEditing) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isEditing]);

  if (isLoading) return <MenuItemAdminSkeleton />;

  if (error || !menuItem) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center py-16">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Menu Item Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            {error?.message || "The menu item could not be loaded."}
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => router.back()} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
            <Button onClick={() => refetch()}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  // ============ HANDLERS ============

  // Handle delete with error handling
  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id).then(() => {
      router.back();
    });
  };

  // Handle toggle availability with error handling
  const handleToggleAvailability = async (
    id: string,
    currentStatus: boolean,
  ) => {
    await toggleMutation.mutateAsync({ id, isAvailable: !currentStatus });
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(menuItem.id);
    console.log("Copied ID to clipboard:", menuItem.id);
  };

  const handleEnterEditMode = () => {
    console.log("Entering edit mode for:", menuItem.name);
    setIsEditing(true);
    setShowEditDialog(false);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isEditing || !hasUnsavedChanges) {
      return;
    }

    try {
      const values = form.getValues();
      await updateMutation.mutateAsync({ id, data: values });
      setIsEditing(false);
      setHasUnsavedChanges(false);
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  const handleCancelEdit = () => {
    if (hasUnsavedChanges) {
      if (
        window.confirm(
          "You have unsaved changes. Are you sure you want to cancel?",
        )
      ) {
        setIsEditing(false);
        form.reset();
      }
    } else {
      setIsEditing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* ============ ALERT DIALOGS ============ */}

      {/* Edit Mode Confirmation Dialog */}
      <AlertDialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Enter Edit Mode
            </AlertDialogTitle>
            <AlertDialogDescription>
              You are about to edit "{menuItem.name}". Make sure to save your
              changes when you're done.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleEnterEditMode}>
              Continue Editing
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Toggle Availability Dialog */}
      <AlertDialog open={showToggleDialog} onOpenChange={setShowToggleDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Power className="h-5 w-5" />
              {menuItem?.isAvailable ? "Deactivate" : "Activate"} Menu Item
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to{" "}
              {menuItem?.isAvailable ? "deactivate" : "activate"} "
              {menuItem.name}"?
              {menuItem?.isAvailable
                ? " This item will no longer be visible to customers."
                : " This item will become available for ordering."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                handleToggleAvailability(id, menuItem?.isAvailable)
              }
              className={
                menuItem?.isAvailable
                  ? "bg-amber-600 hover:bg-amber-700"
                  : "bg-green-600 hover:bg-green-700"
              }
            >
              {menuItem?.isAvailable ? "Deactivate" : "Activate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Delete Menu Item
            </AlertDialogTitle>
            <AlertDialogDescription className="text-red-600">
              <strong className="font-semibold">
                This action cannot be undone.
              </strong>
              <br />
              This will permanently delete "{menuItem.name}" from the menu and
              remove all associated data.
            </AlertDialogDescription>
            <div className="mt-4 p-3 bg-red-50 rounded-md">
              <div className="flex items-center gap-2 text-red-800">
                <Info className="h-4 w-4" />
                <span className="text-sm font-medium">Important:</span>
              </div>
              <ul className="mt-2 text-sm text-red-700 list-disc pl-5 space-y-1">
                <li>All order history for this item will be preserved</li>
                <li>Item will be removed from all active carts</li>
                <li>This action is irreversible</li>
              </ul>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDelete(id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ============ MAIN CONTENT ============ */}

      <Form {...form}>
        <form onSubmit={handleFormSubmit} className="space-y-4 sm:space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold tracking-tight">
                  {isEditing ? (
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem className="sm:col-span-full lg:col-span-1">
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value ?? ""}
                              placeholder="e.g., Caesar Salad"
                              className="!text-3xl font-bold bg-transparent border-0 border-b-2 border-blue-500 rounded-none px-0 py-0 h-auto focus:border-blue-600 focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 w-full"
                              disabled={!isEditing}
                            />
                          </FormControl>
                          <FormMessage className="text-xs sm:text-sm" />
                        </FormItem>
                      )}
                    />
                  ) : (
                    menuItem.name
                  )}
                </h1>
                <Badge
                  variant={menuItem.isAvailable ? "default" : "secondary"}
                  className="ml-2"
                >
                  {menuItem.isAvailable ? "Active" : "Inactive"}
                </Badge>
                {hasUnsavedChanges && isEditing && (
                  <Badge
                    variant="outline"
                    className="ml-2 bg-yellow-50 text-yellow-700 border-yellow-200"
                  >
                    Unsaved Changes
                  </Badge>
                )}
              </div>
              <p className="text-gray-500 text-sm">
                ID: {menuItem.id}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 ml-2"
                  onClick={handleCopyId}
                  type="button"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </p>
            </div>

            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    onClick={handleCancelEdit}
                    disabled={!hasUnsavedChanges}
                    type="button"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={!hasUnsavedChanges || updateMutation.isPending}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {updateMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </>
              ) : (
                <>
                  <div className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-md">
                    <Switch
                      checked={menuItem?.isAvailable}
                      onCheckedChange={() => setShowToggleDialog(true)}
                      id="availability"
                      disabled={
                        updateMutation.isPending || toggleMutation.isPending
                      }
                    />
                    <Label
                      htmlFor="availability"
                      className="text-sm font-medium"
                    >
                      {menuItem?.isAvailable ? "Available" : "Unavailable"}
                    </Label>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon" type="button">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => setShowEditDialog(true)}
                        disabled={updateMutation.isPending}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Item
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => router.push(`/menu-items/${id}`)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Live
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleCopyId}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy ID
                      </DropdownMenuItem>
                      <Separator className="my-1" />
                      <DropdownMenuItem
                        onClick={() => setShowDeleteDialog(true)}
                        className="text-red-600 focus:text-red-600 focus:bg-red-50"
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Item
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
            </div>
          </div>

          {/* Rest of the UI remains the same as before */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Image</CardTitle>
                  <CardDescription>
                    Main display image for the menu item
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <FormField
                      control={form.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">
                            Image
                          </FormLabel>
                          <FormControl>
                            <div className="relative rounded-lg border">
                              <ImageInput
                                imageUrl={field.value}
                                value={field.value}
                                onChange={field.onChange}
                                isEditing
                              />
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  ) : (
                    <div className="relative overflow-hidden rounded-lg border">
                      <img
                        src={menuItem.imageUrl || "/images/default-food.jpg"}
                        alt={menuItem.name}
                        className="w-full h-[300px] object-cover"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Details Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Item Details</CardTitle>
                  <CardDescription>
                    Basic information about the menu item
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Price</Label>

                      {isEditing ? (
                        <FormField
                          control={form.control}
                          name="price"
                          render={({ field }) => (
                            <FormItem>
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
                                        isNaN(numericValue) ? "" : numericValue,
                                      );
                                    }}
                                    disabled={!isEditing}
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
                      ) : (
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(menuItem.price)}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Category</Label>

                      {isEditing ? (
                        <FormField
                          control={form.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem className="sm:col-span-1">
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                                disabled={!isEditing}
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
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-lg px-4 py-1.5"
                        >
                          {menuItem.category}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>

                    {isEditing ? (
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Textarea
                                placeholder="Describe your menu item... Include key ingredients, flavor profile, and serving suggestions."
                                className="min-h-[120px] resize-none bg-background text-base"
                                {...field}
                                value={field.value || ""}
                                disabled={!isEditing}
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
                    ) : (
                      <p className="text-gray-700">{menuItem.description}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Prep Time
                      </Label>
                      {isEditing ? (
                        <FormField
                          control={form.control}
                          name="preparationTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  {...field}
                                  className="h-10 sm:h-11 bg-background text-base"
                                  value={field.value || ""}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    const numericValue = Number(value);
                                    field.onChange(
                                      isNaN(numericValue) ? "" : numericValue,
                                    );
                                  }}
                                  disabled={!isEditing}
                                />
                              </FormControl>
                              <FormMessage className="text-xs sm:text-sm" />
                            </FormItem>
                          )}
                        />
                      ) : (
                        <div className="font-semibold">
                          {menuItem.preparationTime} min
                        </div>
                      )}
                    </div>

                    {menuItem.calories && (
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Flame className="h-4 w-4" />
                          Calories
                        </Label>
                        {isEditing ? (
                          <FormField
                            control={form.control}
                            name="calories"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    {...field}
                                    className="h-10 sm:h-11 bg-background text-base"
                                    value={field.value || ""}
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      const numericValue = Number(value);
                                      field.onChange(
                                        isNaN(numericValue) ? "" : numericValue,
                                      );
                                    }}
                                    disabled={!isEditing}
                                  />
                                </FormControl>
                                <FormMessage className="text-xs sm:text-sm" />
                              </FormItem>
                            )}
                          />
                        ) : (
                          <div className="font-semibold">
                            {menuItem.calories} cal
                          </div>
                        )}
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Station
                      </Label>

                      {isEditing ? (
                        <FormField
                          control={form.control}
                          name="preparationStation"
                          render={({ field }) => (
                            <FormItem className="sm:col-span-1">
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                                disabled={!isEditing}
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
                      ) : (
                        <Badge variant="outline">
                          {menuItem.preparationStation}
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Created</Label>
                      <div className="text-sm text-gray-500">
                        {new Date(menuItem.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Ingredients & Tags */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Ingredients
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isEditing ? (
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
                              (option: any) => option.value,
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
                                  isDisabled={!isEditing}
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
                                Press Enter or tab to add multiple ingredients
                              </p>
                            </FormItem>
                          );
                        }}
                      />
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {menuItem.ingredients.map(
                          (ingredient: string, index: number) => (
                            <Badge key={index} variant="secondary">
                              {ingredient}
                            </Badge>
                          ),
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Tag className="h-5 w-5" />
                      Tags
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isEditing ? (
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
                              (option: any) => option.value,
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
                                  isDisabled={!isEditing}
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
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {menuItem.tags.map((tag: string, index: number) => (
                          <Badge key={index} variant="outline">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Right Column - Actions & Stats */}
            <div className="space-y-6">
              {/* Status Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {menuItem?.isAvailable ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <span>Availability</span>
                    </div>
                    <Badge
                      variant={
                        menuItem?.isAvailable ? "default" : "destructive"
                      }
                      className={`${
                        menuItem?.isAvailable ? "bg-green-500" : ""
                      }`}
                    >
                      {menuItem?.isAvailable ? "Available" : "Unavailable"}
                    </Badge>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {menuItem.isVegetarian ? (
                          <Leaf className="h-5 w-5 text-green-500" />
                        ) : (
                          <Leaf className="h-5 w-5 text-gray-400" />
                        )}
                        <span>Vegetarian</span>
                      </div>
                      {isEditing ? (
                        <FormField
                          control={form.control}
                          name="isVegetarian"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={(checked) =>
                                    field.onChange(checked as boolean)
                                  }
                                  id="isVegetarian"
                                  disabled={!isEditing}
                                />
                              </FormControl>
                              <FormMessage className="text-xs sm:text-sm" />
                            </FormItem>
                          )}
                        />
                      ) : (
                        <>{menuItem.isVegetarian ? "Yes" : "No"}</>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {menuItem.isSpicy ? (
                          <Flame className="h-5 w-5 text-red-500" />
                        ) : (
                          <Flame className="h-5 w-5 text-gray-400" />
                        )}
                        <span>Spicy</span>
                      </div>
                      {isEditing ? (
                        <FormField
                          control={form.control}
                          name="isSpicy"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={(checked) =>
                                    field.onChange(checked as boolean)
                                  }
                                  id="isSpicy"
                                  disabled={!isEditing}
                                />
                              </FormControl>
                              <FormMessage className="text-xs sm:text-sm" />
                            </FormItem>
                          )}
                        />
                      ) : (
                        <>{menuItem.isSpicy ? "Yes" : "No"}</>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {menuItem.isAlcoholic ? (
                          <Wine className="h-5 w-5 text-purple-500" />
                        ) : (
                          <Wine className="h-5 w-5 text-gray-400" />
                        )}
                        <span>Alcoholic</span>
                      </div>
                      {isEditing ? (
                        <FormField
                          control={form.control}
                          name="isAlcoholic"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={(checked) =>
                                    field.onChange(checked as boolean)
                                  }
                                  id="isAlcoholic"
                                  disabled={!isEditing}
                                />
                              </FormControl>
                              <FormMessage className="text-xs sm:text-sm" />
                            </FormItem>
                          )}
                        />
                      ) : (
                        <>{menuItem.isAlcoholic ? "Yes" : "No"}</>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {!isEditing && (
                    <Button
                      onClick={() => setShowToggleDialog(true)}
                      variant={
                        menuItem?.isAvailable ? "destructive" : "default"
                      }
                      className={`w-full ${
                        menuItem?.isAvailable
                          ? ""
                          : "bg-green-500 hover:bg-green-700"
                      }`}
                      type="button"
                      disabled={toggleMutation.isPending}
                    >
                      {menuItem?.isAvailable ? (
                        <>
                          <EyeOff className="h-4 w-4 mr-2" />
                          {toggleMutation.isPending
                            ? "Deactivating..."
                            : "Deactivate Item"}
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-2" />
                          {toggleMutation.isPending
                            ? "Activating..."
                            : "Activate Item"}
                        </>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Statistics Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Total Orders</span>
                    <span className="font-semibold">{formatNumber(1247)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">This Month</span>
                    <span className="font-semibold">{formatCurrency(156)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Revenue</span>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(12458)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Avg. Rating</span>
                    <div className="flex items-center">
                      <span className="font-semibold mr-2">4.8</span>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span key={star} className="text-yellow-500">
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Danger Zone */}
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="text-red-600">Danger Zone</CardTitle>
                  <CardDescription>
                    Irreversible actions. Proceed with caution.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <p className="text-sm text-destructive">
                      Disable the editing mode to delete the menu item.
                    </p>
                  ) : (
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={() => setShowDeleteDialog(true)}
                      type="button"
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {deleteMutation.isPending
                        ? "Deleting..."
                        : "Delete Menu Item"}
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Metadata */}
              <Card>
                <CardHeader>
                  <CardTitle>Metadata</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Created</span>
                    <span>{new Date(menuItem.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Last Updated</span>
                    <span>{new Date(menuItem.updatedAt).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Item ID</span>
                    <span className="font-mono text-xs">{menuItem.id}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
