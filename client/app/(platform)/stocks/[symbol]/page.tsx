export const dynamic = "force-dynamic";

import TradingViewWidget from "@/components/shared/TradingViewWidget";
import {
    SYMBOL_INFO_WIDGET_CONFIG,
} from "@/lib/constants";

import { formatSymbolForTradingView } from '@/lib/utils';

export default async function StockDetails({ params }: StockDetailsPageProps) {
    const { symbol } = await params;
    const tvSymbol = formatSymbolForTradingView(symbol);
    const scriptUrl = `https://s3.tradingview.com/external-embedding/embed-widget-`;


    


    return (
        <div className="flex flex-col flex-1 p-4 md:p-6 lg:px-8 lg:pt-8 lg:pb-0 max-w-360 mx-auto w-full">
            
                    <TradingViewWidget
                        scriptUrl={`${scriptUrl}symbol-info.js`}
                        config={SYMBOL_INFO_WIDGET_CONFIG(tvSymbol)}
                        height={170}
                    />
                
                
               
                
        </div>
    );
}