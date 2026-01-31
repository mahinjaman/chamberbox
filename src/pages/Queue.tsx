import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQueue } from "@/hooks/useQueue";
import { usePatients } from "@/hooks/usePatients";
import { 
  Play, 
  CheckCircle2, 
  Clock, 
  XCircle,
  Users,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const Queue = () => {
  const { 
    queue, 
    isLoading, 
    currentToken, 
    waitingCount, 
    completedCount,
    callNext,
    updateTokenStatus
  } = useQueue();
  const { patients } = usePatients();

  const handleCallNext = async () => {
    await callNext();
  };

  const handleComplete = (id: string) => {
    updateTokenStatus({ id, status: "completed" });
  };

  const handleCancel = (id: string) => {
    updateTokenStatus({ id, status: "cancelled" });
  };

  const waitingTokens = queue.filter((t) => t.status === "waiting");
  const completedTokens = queue.filter((t) => t.status === "completed" || t.status === "cancelled");

  return (
    <DashboardLayout
      title="Queue Management"
      description={`${format(new Date(), "EEEE, MMMM d, yyyy")}`}
      actions={
        <Button 
          onClick={handleCallNext} 
          disabled={waitingCount === 0}
          size="lg"
        >
          <Play className="mr-2 h-4 w-4" />
          Call Next Patient
        </Button>
      }
    >
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card className="bg-success/5 border-success/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{completedCount}</p>
                <p className="text-sm text-muted-foreground">Completed Today</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-warning/5 border-warning/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{waitingCount}</p>
                <p className="text-sm text-muted-foreground">Waiting in Queue</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Play className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {currentToken ? `#${currentToken.token_number}` : "—"}
                </p>
                <p className="text-sm text-muted-foreground">Current Token</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : queue.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Clock className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium text-foreground mb-2">No patients in queue</h3>
            <p className="text-muted-foreground">
              Add patients to the queue from the Patients page
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Current Patient */}
          {currentToken && (
            <Card className="lg:col-span-2 bg-success/5 border-success/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="relative">
                    <div className="w-3 h-3 rounded-full bg-success"></div>
                    <div className="absolute inset-0 w-3 h-3 rounded-full bg-success animate-ping"></div>
                  </div>
                  Now Serving
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-2xl bg-success flex items-center justify-center text-success-foreground">
                      <span className="text-3xl font-bold">#{currentToken.token_number}</span>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {currentToken.patient?.name}
                      </p>
                      <p className="text-muted-foreground">{currentToken.patient?.phone}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleComplete(currentToken.id)}
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Complete
                    </Button>
                    <Button
                      variant="outline"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleCancel(currentToken.id)}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Waiting List */}
          <Card>
            <CardHeader>
              <CardTitle>Waiting ({waitingTokens.length})</CardTitle>
              <CardDescription>Patients waiting to be called</CardDescription>
            </CardHeader>
            <CardContent>
              {waitingTokens.length === 0 ? (
                <p className="text-center py-6 text-muted-foreground">
                  No patients waiting
                </p>
              ) : (
                <div className="space-y-2">
                  {waitingTokens.map((token, index) => (
                    <div
                      key={token.id}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg border transition-colors",
                        index === 0 && "bg-warning/5 border-warning/30"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm",
                            index === 0
                              ? "bg-warning text-warning-foreground"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          #{token.token_number}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {token.patient?.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {token.patient?.phone}
                          </p>
                        </div>
                      </div>
                      {index === 0 && (
                        <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
                          Next
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Completed List */}
          <Card>
            <CardHeader>
              <CardTitle>Completed ({completedTokens.length})</CardTitle>
              <CardDescription>Patients seen today</CardDescription>
            </CardHeader>
            <CardContent>
              {completedTokens.length === 0 ? (
                <p className="text-center py-6 text-muted-foreground">
                  No patients completed yet
                </p>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {completedTokens.map((token) => (
                    <div
                      key={token.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 opacity-70"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold text-sm text-muted-foreground">
                          #{token.token_number}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {token.patient?.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {token.patient?.phone}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={token.status === "completed" ? "secondary" : "destructive"}
                      >
                        {token.status === "completed" ? (
                          <><CheckCircle2 className="mr-1 h-3 w-3" /> Done</>
                        ) : (
                          <><XCircle className="mr-1 h-3 w-3" /> Cancelled</>
                        )}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Queue;
