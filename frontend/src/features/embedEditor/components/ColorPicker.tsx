interface ColorPickerProps {
  _color: number;
  onChange: (_color: number) => void;
}

const PRESET_COLORS = [
  0x5865f2, // Blurple
  0x57f287, // Green
  0xfee75c, // Yellow
  0xeb459e, // Fuchsia
  0xed4245, // Red
  0xffffff, // White
  0x23272a, // Dark
  0x2f3136, // Darker
];

function numberToHex(num: number): string {
  return "#" + num.toString(16).padStart(6, "0");
}

function hexToNumber(hex: string): number {
  return parseInt(hex.replace("#", ""), 16);
}

export function ColorPicker({ _color, onChange }: ColorPickerProps) {
  return (
    <div className="space-y-2">
      <label className="label">Embed Color</label>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={numberToHex(_color)}
          onChange={(e) => onChange(hexToNumber(e.target.value))}
          className="w-10 h-10 rounded cursor-pointer border-0 bg-transparent"
        />
        <input
          type="text"
          value={numberToHex(_color)}
          onChange={(e) => {
            const val = e.target.value;
            if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
              onChange(hexToNumber(val));
            }
          }}
          className="input w-28 font-mono"
          placeholder="#5865f2"
        />
        <div className="flex gap-1">
          {PRESET_COLORS.map((preset) => (
            <button
              key={preset}
              onClick={() => onChange(preset)}
              className="w-6 h-6 rounded border border-discord-light hover:scale-110 transition-transform"
              style={{ backgroundColor: numberToHex(preset) }}
              title={numberToHex(preset)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
