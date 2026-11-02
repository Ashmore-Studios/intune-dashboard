import { Button, Card, CardDescription, CardHeader, CardTitle, DashboardPage } from "@ashmore-studios/ui";
import type { PageId } from "../legacy/navigation";
import { navGroups } from "../shell/nav";

export function Reports({ onOpen }: { onOpen: (id: PageId) => void }) {
  const groups = navGroups.filter((group) => group.label !== "Settings");
  return (
    <DashboardPage title="Reports" description="Every report already available in this tenant console.">
      <div className="grid gap-6">
        {groups.map((group) => (
          <section key={group.label} className="grid gap-3">
            <h2 className="text-sm font-medium text-muted-foreground">{group.label}</h2>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {group.items.filter((item) => item.id !== "reports").map((item) => (
                <Card key={item.id}>
                  <CardHeader>
                    <CardTitle className="text-base">{item.label}</CardTitle>
                    <CardDescription>Open the existing {item.label} report.</CardDescription>
                    <Button className="mt-3 w-fit" variant="outline" onClick={() => onOpen(item.id)}>{item.label}</Button>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </section>
        ))}
      </div>
    </DashboardPage>
  );
}
