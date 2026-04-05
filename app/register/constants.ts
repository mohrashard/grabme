export const DISTRICTS = [
    "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", "Galle", "Gampaha",
    "Hambantota", "Jaffna", "Kalutara", "Kandy", "Kegalle", "Kilinochchi", "Kurunegala",
    "Mannar", "Matale", "Matara", "Moneragala", "Mullaitivu", "Nuwara Eliya", "Polonnaruwa",
    "Puttalam", "Ratnapura", "Trincomalee", "Vavuniya"
];

export const TRADE_SUB_SKILLS: Record<string, string[]> = {
    "Electrician (වයරින් බාස්)": [
        "House Wiring (ගෙවල් වයරින්)",
        "DB Board & Trip Switch Fixing (ඩීබී බෝඩ් / ට්‍රිප් ස්විච් හයිකිරීම)",
        "Water Motor Repair (වතුර මෝටර් හැදීම)",
        "Three Phase Wiring (ත්‍රී ෆේස් වයරින්)",
        "CCTV Installation (CCTV කැමරා සවිකිරීම)",
        "Solar Panel Fixing (සෝලර් පැනල් හයිකිරීම)",
        "Fan / Oven Repair (ෆෑන් / අවන් හැදීම)"
    ],

    "Plumber (බට බාස් / ප්ලම්බර්)": [
        "Pipe Leaks & Tap Fixing (වතුර ලීක් හැදීම / ටැප් හයිකිරීම)",
        "Water Motor & Pump Installation (මෝටර් / පොම්ප හයිකිරීම)",
        "Drain & Gully Block Clearing (ගලි / කාණු බ්ලොක් ඇරීම)",
        "Water Tank Cleaning (වතුර ටැංකි සුද්ද කිරීම)",
        "Gutter Fixing (වැහි පීලි / ගටර් ගැසීම)",
        "Bathroom Fittings (බාත්රූම් ෆිටින්ස් හයිකිරීම)",
        "Septic Tank / Gully Bowser (ගලි බවුසර් / සෙප්ටික් ටැංකි හිස් කිරීම)"
    ],

    "AC & Fridge Repair (ඒසී / ෆ්‍රිජ් වැඩ)": [
        "A/C Full Service (A/C සර්විස් කිරීම)",
        "Gas Refilling (ගෑස් ගැසීම)",
        "Water Leak Fix (වතුර ලීක් හැදීම)",
        "A/C Installation (A/C හයිකිරීම)",
        "Fridge / Freezer Repair (ෆ්‍රිජ් / ඩීප් ෆ්‍රීසර් හැදීම)",
        "Washing Machine Repair (වොෂින් මැෂින් හැදීම)"
    ],

    "Carpenter (වඩු බාස්)": [
        "Roof Work (වහලේ වැඩ)",
        "Pantry Cupboards (පැන්ට්‍රි කබඩ් වැඩ)",
        "Door & Window Fixing (දොර ජනෙල් හයිකිරීම)",
        "Furniture Repair (ලී බඩු හැදීම)",
        "Wood Polishing (ලී පොලිෂ් කිරීම)",
        "Ceiling Fixing (සිවිලිම් ගැසීම)"
    ],

    "Mason (මේසන් බාස්)": [
        "Brick Work (බිත්ති බැඳීම)",
        "Plastering (කපරාරු කිරීම)",
        "Tile Laying (ටයිල් ඇල්ලීම)",
        "Concrete / Slab Work (කොන්ක්‍රීට් / ස්ලැබ් දැමීම)",
        "Interlock Paving (ඉන්ටර්ලොක් ඇල්ලීම)",
        "Granite / Marble Work (ග්‍රැනයිට් / මාර්බල් වැඩ)"
    ],

    "Painter (පේන්ට් බාස්)": [
        "House Painting (ගෙවල් පේන්ට් කිරීම)",
        "Wall Putty / Skimming (වෝල් පුට්ටි / ස්කිමිං ගෑම)",
        "Waterproofing (වෝටර්ප්‍රූෆින් වැඩ)",
        "Wood Polish & Varnish (ලී පොලිෂ් / වාර්නිෂ් කිරීම)",
        "Gate & Grill Painting (ගේට්ටු / ග්‍රිල් පේන්ට් කිරීම)"
    ],

    "Aluminium & Glass (ඇලුමිනියම් / වීදුරු වැඩ)": [
        "Aluminium Doors & Windows (ඇලුමිනියම් දොර / ජනෙල්)",
        "Office Partitions (ඔෆිස් පාර්ටිෂන්)",
        "Pantry Cupboards (ඇලුමිනියම් පැන්ට්‍රි කබඩ්)",
        "Glass Fixing / Replacement (වීදුරු දැමීම / මාරු කිරීම)"
    ],

    "Welder (වැල්ඩින් / යකඩ වැඩ)": [
        "Gate & Grills (ගේට්ටු සහ ග්‍රිල් වැඩ)",
        "Roof Truss / Shed Work (යකඩ වහල / ෂෙඩ් ගැසීම)",
        "Iron Welding (යකඩ වැල්ඩින්)",
        "Stainless Steel Work (ස්ටේන්ලස් ස්ටීල් වැඩ)"
    ],

    "Cleaner / Helper (ක්ලීනර් / අත් උදව්කරුවන්)": [
        "House Cleaning (ගෙවල් සුද්ද කිරීම)",
        "Grass Cutting (තණකොළ කැපීම)",
        "Sofa & Carpet Cleaning (සෝෆා සහ කාපට් සේදීම)",
        "Tree Cutting (ගස් කැපීම)",
        "Construction Cleanup (ඉදිකිරීම් භූමි සුද්ද කිරීම)"
    ],

    "Handyman (සුළු අලුත්වැඩියා වැඩ)": [
        "General Repairs (සාමාන්‍ය අලුත්වැඩියාවන්)",
        "Drilling & Hanging (ඩ්‍රිල් කරලා හයි කිරීම)",
        "Furniture Assembly (ෆර්නිචර් සෙට් කිරීම)",
        "Door Lock Changing (දොරේ ලොක් මාරු කිරීම)"
    ],

    "Vehicle Mechanic (වාහන මිකැනික්)": [
        "Tinkering & Painting (ටින්කරින් සහ පේන්ට් වැඩ)",
        "Engine Repair (එන්ජින් අලුත්වැඩියාව)",
        "Vehicle A/C Repair (වාහන A/C වැඩ)",
        "Auto Electrical (ඔටෝ ඉලෙක්ට්‍රිකල් වැඩ)"
    ],

    "Other (වෙනත්)": []
};

export const TRADES = Object.keys(TRADE_SUB_SKILLS);

export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
