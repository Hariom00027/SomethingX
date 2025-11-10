import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import apiClient from "@/lib/apiClient";

const RoleReadyFreshers = () => {
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrainings = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await apiClient.get("/trainings");
        const catalogue = (response.data ?? []).map((item, index) => ({
          ...item,
          apiId: item.id ?? item._id ?? `training-${index}`,
        }));
        const enriched = catalogue.map((entry) => ({
          ...entry,
          dayOneReady: entry.dayOneReady === undefined ? true : entry.dayOneReady,
        }));
        setTrainings(enriched);
      } catch (err) {
        console.error("Failed to load trainings", err);
        setError("Unable to load role ready trainings right now. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchTrainings();
  }, []);

  const displayTrainings = useMemo(() => {
    const items = trainings ?? [];
    return [...items].sort((a, b) => {
      const aReady = a.dayOneReady ? 1 : 0;
      const bReady = b.dayOneReady ? 1 : 0;
      return bReady - aReady;
    });
  }, [trainings]);

  if (loading) {
    return (
      <DashboardLayout sidebar={<div>Sidebar</div>}>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-lg">Loading role ready cohorts...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebar={<div>Sidebar</div>}>
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Role Ready Freshers</h1>
            <p className="text-muted-foreground max-w-2xl">
              Access day-one ready talent pipelines or tailor a bespoke training cohort for niche roles. Each program is
              benchmarked to deliver candidates who can contribute from day one.
            </p>
            {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              navigate("/industry/role-ready-freshers/request", {
                state: { mode: "custom" },
              })
            }
          >
            Request Custom Training
          </Button>
        </div>

        {displayTrainings.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <p className="text-lg text-muted-foreground">
              No training programs found. Seed demo data or add trainings to continue.
            </p>
            <div className="space-y-2 text-left max-w-xl mx-auto">
              <p className="text-sm text-gray-600">Seed sample trainings via:</p>
              <pre className="bg-gray-900 text-white text-sm rounded p-3 overflow-x-auto">
                curl -X POST http://localhost:8080/api/trainings/seed \
-H "Content-Type: application/json" \
-d @backend/src/main/resources/training-data.json
              </pre>
              <p className="text-sm text-gray-600">Refresh this page after seeding.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {displayTrainings.map((training) => (
              <Card key={training.apiId} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center justify-between gap-2">
                    {training.roleName}
                    <span
                      className={`text-xs font-semibold uppercase ${
                        training.dayOneReady ? "text-green-600" : "text-amber-600"
                      }`}
                    >
                      {training.dayOneReady ? "Day-One Ready" : "In Ramp-Up"}
                    </span>
                  </CardTitle>
                  <CardDescription className="line-clamp-3">{training.roleDescription}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-3 text-sm">
                  <div>
                    <span className="font-semibold">Industry:</span> {training.industry}
                  </div>
                  <div>
                    <span className="font-semibold">Mode:</span> {training.trainingMode}
                  </div>
                  <div>
                    <span className="font-semibold">Duration:</span> {training.trainingDuration}
                  </div>
                  <div>
                    <span className="font-semibold">Intake Capacity:</span> {training.totalStudentsAllowed}
                  </div>
                  <div>
                    <span className="font-semibold">Day-One Summary:</span> {training.dayOneSummary}
                  </div>
                  {training.dayOneDeliverables?.length > 0 && (
                    <div>
                      <span className="font-semibold">Core Deliverables:</span>
                      <ul className="list-disc list-inside text-xs space-y-1 mt-1">
                        {training.dayOneDeliverables.map((deliverable, idx) => (
                          <li key={idx}>{deliverable}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div>
                    <span className="font-semibold">Key Skills:</span>
                    <ul className="list-disc list-inside text-xs space-y-1 mt-1">
                      {training.skillsCovered?.slice(0, 4).map((skill, idx) => (
                        <li key={idx}>{skill}</li>
                      ))}
                      {training.skillsCovered?.length > 4 && (
                        <li className="text-muted-foreground">
                          +{training.skillsCovered.length - 4} more
                        </li>
                      )}
                    </ul>
                  </div>
                </CardContent>
                <CardFooter className="grid grid-cols-1 gap-2">
                  <Button
                    type="button"
                    disabled={!training.apiId}
                    title={!training.apiId ? "Training identifier missing. Please refresh." : undefined}
                    onClick={() =>
                      navigate("/industry/role-ready-freshers/request", {
                        state: { training, mode: "existing" },
                      })
                    }
                  >
                    Apply for Cohort
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() =>
                      navigate("/industry/role-ready-freshers/request", {
                        state: { training, mode: "custom" },
                      })
                    }
                  >
                    Request Custom Training
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default RoleReadyFreshers;


