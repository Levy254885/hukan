'use client';

import { useState } from 'react';
import { Phone, MessageCircle, Calendar, Heart, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EnquiryForm } from './EnquiryForm';
import { ViewingRequestForm } from './ViewingRequestForm';
import { generateWhatsAppLink, cn } from '@/lib/utils';

interface PropertyContactPanelProps {
  propertyId: string;
  propertyTitle: string;
  locationLabel: string;
  priceLabel: string;
  agentPhone?: string;
}

type Tab = 'contact' | 'enquiry' | 'viewing';

export function PropertyContactPanel({
  propertyId,
  propertyTitle,
  locationLabel,
  priceLabel,
  agentPhone = '+254712345678',
}: PropertyContactPanelProps) {
  const [tab, setTab] = useState<Tab>('contact');

  const whatsappUrl = generateWhatsAppLink(agentPhone, {
    title: propertyTitle,
    location: locationLabel,
    price: priceLabel,
    id: propertyId,
  });

  return (
    <div className="sticky top-20 space-y-4 rounded-xl border border-border bg-card p-5 shadow-sm">
      <div>
        <p className="text-sm text-muted-foreground">Contact agent</p>
        <p className="font-semibold">Hukan Agent</p>
        <p className="text-sm text-muted-foreground">Usually responds within a few hours</p>
      </div>

      <div className="flex gap-1 rounded-lg border border-border p-1">
        {(
          [
            { id: 'contact', label: 'Contact' },
            { id: 'enquiry', label: 'Enquiry' },
            { id: 'viewing', label: 'Viewing' },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              'flex-1 rounded-md py-1.5 text-xs font-medium transition-colors',
              tab === t.id
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'contact' && (
        <div className="space-y-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-md bg-[#25D366] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#1da851]"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </a>
          <a href={`tel:${agentPhone}`}>
            <Button variant="outline" className="w-full">
              <Phone className="mr-2 h-4 w-4" />
              Call Agent
            </Button>
          </a>
          <Button variant="secondary" className="w-full" onClick={() => setTab('enquiry')}>
            Send Enquiry
          </Button>
          <Button variant="outline" className="w-full" onClick={() => setTab('viewing')}>
            <Calendar className="mr-2 h-4 w-4" />
            Request Viewing
          </Button>
        </div>
      )}

      {tab === 'enquiry' && (
        <EnquiryForm
          propertyId={propertyId}
          propertyTitle={propertyTitle}
          agentPhone={agentPhone}
        />
      )}

      {tab === 'viewing' && (
        <ViewingRequestForm
          propertyId={propertyId}
          propertyTitle={propertyTitle}
        />
      )}

      <div className="flex gap-2 border-t border-border pt-4">
        <Button variant="ghost" size="sm" className="flex-1">
          <Heart className="mr-1.5 h-4 w-4" />
          Save
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex-1"
          onClick={() => {
            if (navigator.share) {
              navigator.share({ title: propertyTitle, url: window.location.href });
            } else {
              navigator.clipboard.writeText(window.location.href);
            }
          }}
        >
          <Share2 className="mr-1.5 h-4 w-4" />
          Share
        </Button>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Property ID: HKN-{propertyId.slice(-8).toUpperCase()}
      </p>
    </div>
  );
}
