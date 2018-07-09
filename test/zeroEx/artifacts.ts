import { ContractArtifact } from '@0xproject/sol-compiler';

import * as Exchange from './Exchange.json';

export const artifacts = {
    Exchange: (Exchange as any) as ContractArtifact,
};
