import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

interface ClassOption {
  id: string;
  name: string;
}

interface SubjectOption {
  id: string;
  name: string;
}

interface ClassSubjectSelectorProps {
  classes: ClassOption[];
  subjects: SubjectOption[];
  selectedClassId: string;
  selectedSubjectId?: string;
  onClassChange: (classId: string) => void;
  onSubjectChange?: (subjectId: string) => void;
  showSubjectSelector?: boolean;
  hasMultipleClasses: boolean;
}

export const ClassSubjectSelector = ({
  classes,
  subjects,
  selectedClassId,
  selectedSubjectId,
  onClassChange,
  onSubjectChange,
  showSubjectSelector = true,
  hasMultipleClasses,
}: ClassSubjectSelectorProps) => {
  if (!hasMultipleClasses && classes.length === 1 && !showSubjectSelector) {
    return null;
  }

  return (
    <Card className="mb-4">
      <CardContent className="pt-4">
        <div className="flex flex-wrap gap-4">
          {hasMultipleClasses && (
            <div className="w-48">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                Select Class
              </Label>
              <Select value={selectedClassId} onValueChange={onClassChange}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choose a class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {showSubjectSelector && subjects.length > 0 && onSubjectChange && (
            <div className="w-48">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                Select Subject
              </Label>
              <Select 
                value={selectedSubjectId} 
                onValueChange={onSubjectChange}
                disabled={!selectedClassId && hasMultipleClasses}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choose a subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {!hasMultipleClasses && classes.length === 1 && (
            <div className="w-48">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                Assigned Class
              </Label>
              <p className="mt-1 font-medium">{classes[0].name}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
