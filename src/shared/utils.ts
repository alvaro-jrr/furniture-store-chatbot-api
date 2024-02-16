export function validateNumberPrecision({
	value,
	maxPrecision = 0,
}: {
	value: number;
	maxPrecision: number;
}) {
	if (maxPrecision < 0) {
		throw new Error("Max precision must be bigger or equal to 0");
	}

	const [, decimals = ""] = String(value).split(".");
	return decimals.length <= maxPrecision;
}
