
import { RawSignal } from './interfaces';
import { PulseSummary } from './pulse-aggregator';

export interface SignalAggregator {
    aggregate(signals: RawSignal[]): PulseSummary[];
}

import { PulseAggregator as PulseAggregatorImpl } from './pulse-aggregator';

export class IngestionAggregator implements SignalAggregator {
    private aggregator = new PulseAggregatorImpl();

    aggregate(signals: RawSignal[]): PulseSummary[] {
        return this.aggregator.aggregate(signals);
    }
}
