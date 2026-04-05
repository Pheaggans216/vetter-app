import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function StepExperience({ profile, update }) {
  return (
    <div>
      <h2 className="text-[22px] font-heading font-bold text-foreground mb-1">Your experience</h2>
      <p className="text-muted-foreground text-[14px] mb-6">
        Tell buyers about your background. A strong profile earns more trust and more jobs.
      </p>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-[13px] font-medium">Full Name</Label>
          <Input
            placeholder="Your full name"
            value={profile.display_name}
            onChange={(e) => update({ display_name: e.target.value })}
            className="rounded-xl h-11"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-[13px] font-medium">Years of Experience</Label>
          <Input
            type="number"
            placeholder="e.g. 8"
            value={profile.years_of_experience}
            onChange={(e) => update({ years_of_experience: e.target.value })}
            className="rounded-xl h-11"
            min="0"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-[13px] font-medium">Professional Bio</Label>
          <Textarea
            placeholder="Describe your background, expertise, and what makes you a trusted inspector..."
            value={profile.bio}
            onChange={(e) => update({ bio: e.target.value })}
            className="rounded-xl min-h-[110px]"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-[13px] font-medium">Work History / Experience Summary</Label>
          <Textarea
            placeholder="List past employers, certifications earned, or notable projects..."
            value={profile.work_history}
            onChange={(e) => update({ work_history: e.target.value })}
            className="rounded-xl min-h-[90px]"
          />
        </div>
      </div>
    </div>
  );
}