import { useState } from 'react'
import { Check, Copy, Gift, Link2, MessageCircle } from 'lucide-react'
import { Modal } from './Modal'
import type { Departure, Tour } from '../types'
import { copyText } from '../lib/clipboard'
import { buildShareLink } from '../lib/share'
import { useToast } from '../state/toastContext'
import { formatDateShort, formatPrice } from '../lib/format'
import { seatsLeft } from '../lib/seats'

export function ShareModal({
  open,
  onClose,
  tour,
  departure,
  shareCode,
}: {
  open: boolean
  onClose: () => void
  tour: Tour
  departure: Departure
  shareCode?: string
}) {
  const { pushToast } = useToast()
  const [copied, setCopied] = useState<'link' | 'message' | null>(null)
  const link = buildShareLink(tour, departure, shareCode)
  const left = seatsLeft(departure)
  const seatsPhrase = left === 1 ? 'one seat left' : `${left} seats left`
  // Only claim a seat in the message when the sharer actually holds one.
  const message = shareCode
    ? `I've got a seat on ${tour.title} in Johor on ${formatDateShort(departure.date)} — ${formatPrice(
        tour.sharedSeatPrice,
      )} a seat, local host driving, ${seatsPhrase}. Claim one here: ${link}`
    : `${tour.title} in Johor on ${formatDateShort(departure.date)} — ${formatPrice(
        tour.sharedSeatPrice,
      )} a seat, local host driving, three seats in the car and ${seatsPhrase}. Shall we take two? ${link}`

  async function handleCopy(value: string, kind: 'link' | 'message') {
    const ok = await copyText(value)
    if (ok) {
      setCopied(kind)
      window.setTimeout(() => setCopied(null), 2000)
      pushToast(kind === 'link' ? 'Invite link copied.' : 'Invite message copied.')
    } else {
      pushToast('Could not copy automatically — select the text and copy it.', 'error')
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Invite a friend to this car"
      description={
        left > 0
          ? `${left === 1 ? 'One seat' : `${left} seats`} left on ${tour.title}, ${formatDateShort(departure.date)}.`
          : `${tour.title} on ${formatDateShort(departure.date)} is confirmed.`
      }
    >
      <div className="space-y-5">
        <div>
          <label className="label" htmlFor="share-link">
            Your share link
          </label>
          <div className="flex gap-2">
            <input
              id="share-link"
              readOnly
              value={link}
              className="field font-mono text-xs"
              onFocus={(e) => e.currentTarget.select()}
            />
            <button type="button" onClick={() => handleCopy(link, 'link')} className="btn btn-forest shrink-0 px-3.5">
              {copied === 'link' ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
              <span className="sr-only sm:not-sr-only">{copied === 'link' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        <div>
          <p className="label">Ready-to-send message</p>
          <p className="rounded-xl border border-line bg-sand/50 p-3 text-sm leading-relaxed text-charcoal/80">
            {message}
          </p>
          <button
            type="button"
            onClick={() => handleCopy(message, 'message')}
            className="btn btn-quiet mt-2 w-full"
          >
            <MessageCircle className="size-4" aria-hidden="true" />
            {copied === 'message' ? 'Message copied' : 'Copy message'}
          </button>
        </div>

        <div className="flex items-start gap-3 rounded-xl border border-gold/30 bg-gold-soft p-3.5">
          <Gift className="mt-0.5 size-5 shrink-0 text-gold" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold text-forest">
              Earn S$10 JB Weekend credit when a friend joins through your link.
            </p>
            <p className="mt-1 text-xs leading-relaxed text-charcoal/70">
              Credit lands after their trip is confirmed. It applies to your next seat, not this one.
            </p>
          </div>
        </div>

        <p className="flex items-start gap-2 text-xs text-sage">
          <Link2 className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          Anyone with this link can claim a seat in this exact car. Your contact details are never shared.
        </p>
      </div>
    </Modal>
  )
}
