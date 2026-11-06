import { Showcase } from "@/components/display/showcase";
import { getBrandLogos } from "@/server/brand";

/** `/`: the visitor display for the experience center. */
export default function DisplayPage() {
  return <Showcase logos={getBrandLogos()} />;
}
