import { Check, Star } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  PRICE_MATRIX,
  HOUSE_LABELS,
  SERVICE_LABELS,
  PACKAGE_LABELS,
  PACKAGE_INCLUDES,
  formatINR,
  type ServiceType,
  type HouseType,
  type PackageType,
} from "@/lib/pricing"

const services: ServiceType[] = ["local", "intercity"]
const houses: HouseType[] = ["1bhk", "2bhk", "3bhk"]
const packages: PackageType[] = ["basic", "standard"]

export function PriceMatrix() {
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {services.map((service) => (
        <Card key={service} className="border-border">
          <CardHeader>
            <CardTitle className="text-xl">{SERVICE_LABELS[service]}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {service === "local"
                ? "Same-city moves within Darbhanga."
                : "Door-to-door from Darbhanga to Patna."}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {houses.map((house) => (
              <div key={house}>
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="text-sm font-semibold">{HOUSE_LABELS[house]}</h4>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {packages.map((pkg) => {
                    const isStandard = pkg === "standard"
                    return (
                      <div
                        key={pkg}
                        className={`relative rounded-lg border p-4 ${
                          isStandard ? "border-accent bg-accent/5" : "border-border bg-card"
                        }`}
                      >
                        {isStandard && (
                          <Badge className="absolute -top-2 right-3 gap-1 bg-accent text-accent-foreground hover:bg-accent">
                            <Star className="h-3 w-3 fill-current" />
                            Recommended
                          </Badge>
                        )}
                        <div className="flex items-baseline justify-between">
                          <span className="text-sm font-medium">{PACKAGE_LABELS[pkg]}</span>
                          <span className="text-lg font-bold">
                            {formatINR(PRICE_MATRIX[service][house][pkg])}
                          </span>
                        </div>
                        <ul className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                          {PACKAGE_INCLUDES[pkg].map((inc) => (
                            <li key={inc} className="flex items-center gap-1.5">
                              <Check className="h-3 w-3 text-accent" />
                              {inc}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
