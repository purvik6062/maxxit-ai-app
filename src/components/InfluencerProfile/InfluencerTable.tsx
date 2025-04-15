"use client";
import React from "react";
import { useSignals } from "../../hooks/useSignals";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button, buttonVariants } from "../ui/button";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { TableSkeleton } from "../ui/table-skeleton";

// Define props for the component
interface InfluencerTableProps {
  influencerId: string;
}

// Destructure influencerId from props
function InfluencerTable({ influencerId }: InfluencerTableProps) {
  // Pass influencerId to the hook
  const { signals, loading, error, total, page, setPage, limit } = useSignals({
    influencerId,
  });

  const totalPages = Math.ceil(total / limit);

  if (error) {
    return <div className="text-red-500 p-4">Error: {error.message}</div>;
  }

  return (
    <div className="w-full">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Token ID</TableHead>
              <TableHead>Entry Price</TableHead>
              <TableHead>Exit Price</TableHead>
              <TableHead>P&L</TableHead>
              <TableHead>Stop Loss</TableHead>
              <TableHead>TP1</TableHead>
              <TableHead>TP2</TableHead>
              <TableHead>Signal Date</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableSkeleton rows={limit} columns={9} />
            ) : signals.length > 0 ? (
              signals.map((signal, index) => (
                <TableRow
                  key={signal._id}
                  className={
                    index % 2 === 0
                      ? "bg-accent/20 hover:bg-muted/60"
                      : "hover:bg-muted/50"
                  }
                >
                  <TableCell>{signal.tokenId}</TableCell>
                  <TableCell className="text-right">
                    ${signal.entryPrice.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    ${signal.exitPrice.toLocaleString()}
                  </TableCell>
                  <TableCell
                    className={`${
                      signal.pnl.startsWith("-")
                        ? "text-red-500"
                        : "text-green-500"
                    } text-right font-medium`}
                  >
                    {signal.pnl}
                  </TableCell>
                  <TableCell className="text-right">
                    ${signal.stopLoss.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    ${signal.takeProfit1.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    ${signal.takeProfit2.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(
                      new Date(signal.signalGenerationDate),
                      "MMM dd, yy HH:mm"
                    )}
                  </TableCell>
                  <TableCell>
                    <a
                      href={signal.ipfsLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:text-blue-800 hover:underline text-sm"
                    >
                      <ExternalLink className="h-3.5 w-3.5 mr-1" />
                      Details
                    </a>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="h-32 text-center text-muted-foreground"
                >
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <p>No trading signals found for this influencer.</p>
                    <p className="text-sm">
                      Try selecting a different influencer or check back later.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-2 py-4">
        <div className="text-sm text-gray-500">
          Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of{" "}
          {total} results
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page + 1)}
            disabled={page >= totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default InfluencerTable;
