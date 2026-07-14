import { useDashboardData } from '@/hooks/useDashboardData';
import type { HalloWeltEintrag } from '@/types/app';
import { LivingAppsService } from '@/services/livingAppsService';
import { useState, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { IconAlertCircle, IconTool, IconRefresh, IconCheck, IconPlus, IconPencil, IconTrash, IconSearch, IconFileText, IconHash } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatCard } from '@/components/StatCard';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { HalloWeltEintragDialog } from '@/components/dialogs/HalloWeltEintragDialog';
import { AI_PHOTO_SCAN, AI_PHOTO_LOCATION } from '@/config/ai-features';

const APPGROUP_ID = '6a56309119a637d479e5e93a';
const REPAIR_ENDPOINT = '/claude/build/repair';

export default function DashboardOverview() {
  const {
    halloWeltEintrag,
    loading, error, fetchAll,
  } = useDashboardData();

  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<HalloWeltEintrag | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<HalloWeltEintrag | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return halloWeltEintrag;
    return halloWeltEintrag.filter(r =>
      (r.fields.titel ?? '').toLowerCase().includes(q) ||
      (r.fields.beschreibung ?? '').toLowerCase().includes(q) ||
      String(r.fields.nummer ?? '').includes(q)
    );
  }, [halloWeltEintrag, search]);

  const handleCreate = async (fields: HalloWeltEintrag['fields']) => {
    await LivingAppsService.createHalloWeltEintragEntry(fields);
    fetchAll();
  };

  const handleUpdate = async (fields: HalloWeltEintrag['fields']) => {
    if (!editRecord) return;
    await LivingAppsService.updateHalloWeltEintragEntry(editRecord.record_id, fields);
    fetchAll();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await LivingAppsService.deleteHalloWeltEintragEntry(deleteTarget.record_id);
    fetchAll();
    setDeleteTarget(null);
  };

  if (loading) return <DashboardSkeleton />;
  if (error) return <DashboardError error={error} onRetry={fetchAll} />;

  return (
    <div className="space-y-6">
      {/* KPI-Leiste */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Einträge gesamt"
          value={String(halloWeltEintrag.length)}
          description="Hallo Welt Einträge"
          icon={<IconFileText size={18} className="text-muted-foreground" />}
        />
        <StatCard
          title="Einträge mit Nummer"
          value={String(halloWeltEintrag.filter(r => r.fields.nummer != null).length)}
          description="Nummerierte Einträge"
          icon={<IconHash size={18} className="text-muted-foreground" />}
        />
        <StatCard
          title="Mit Beschreibung"
          value={String(halloWeltEintrag.filter(r => r.fields.beschreibung).length)}
          description="Einträge mit Beschreibungstext"
          icon={<IconFileText size={18} className="text-muted-foreground" />}
        />
      </div>

      {/* Aktionsleiste */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground shrink-0" />
          <Input
            placeholder="Suchen..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={() => { setEditRecord(null); setDialogOpen(true); }}>
          <IconPlus size={16} className="mr-2 shrink-0" />
          Neuer Eintrag
        </Button>
      </div>

      {/* Eintrags-Karten */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 rounded-2xl border border-dashed bg-muted/20">
          <IconFileText size={48} className="text-muted-foreground" stroke={1.5} />
          <div className="text-center">
            <p className="font-medium text-foreground">
              {search ? 'Keine Treffer gefunden' : 'Noch keine Einträge'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {search ? 'Versuche einen anderen Suchbegriff.' : 'Erstelle deinen ersten Hallo Welt Eintrag.'}
            </p>
          </div>
          {!search && (
            <Button size="sm" onClick={() => { setEditRecord(null); setDialogOpen(true); }}>
              <IconPlus size={14} className="mr-1 shrink-0" />
              Eintrag erstellen
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(record => (
            <div
              key={record.record_id}
              className="rounded-2xl bg-card border shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-shadow overflow-hidden"
            >
              <div className="flex items-start justify-between gap-2 min-w-0">
                <div className="min-w-0 flex-1">
                  {record.fields.nummer != null && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 rounded-full px-2 py-0.5 mb-2">
                      <IconHash size={11} className="shrink-0" />
                      {record.fields.nummer}
                    </span>
                  )}
                  <h3 className="font-semibold text-foreground text-base leading-snug truncate">
                    {record.fields.titel || <span className="text-muted-foreground italic">Kein Titel</span>}
                  </h3>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => { setEditRecord(record); setDialogOpen(true); }}
                  >
                    <IconPencil size={15} className="shrink-0" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => setDeleteTarget(record)}
                  >
                    <IconTrash size={15} className="shrink-0" />
                  </Button>
                </div>
              </div>

              {record.fields.beschreibung && (
                <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                  {record.fields.beschreibung}
                </p>
              )}

              {!record.fields.beschreibung && (
                <p className="text-sm text-muted-foreground/50 italic">Keine Beschreibung</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Dialoge */}
      <HalloWeltEintragDialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditRecord(null); }}
        onSubmit={editRecord ? handleUpdate : handleCreate}
        defaultValues={editRecord?.fields}
        enablePhotoScan={AI_PHOTO_SCAN['HalloWeltEintrag']}
        enablePhotoLocation={AI_PHOTO_LOCATION['HalloWeltEintrag']}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Eintrag löschen"
        description={`Soll der Eintrag "${deleteTarget?.fields.titel ?? 'Unbenannt'}" wirklich gelöscht werden? Diese Aktion kann nicht rückgängig gemacht werden.`}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-9 w-36" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
      </div>
      <Skeleton className="h-64 rounded-2xl" />
    </div>
  );
}

function DashboardError({ error, onRetry }: { error: Error; onRetry: () => void }) {
  const [repairing, setRepairing] = useState(false);
  const [repairStatus, setRepairStatus] = useState('');
  const [repairDone, setRepairDone] = useState(false);
  const [repairFailed, setRepairFailed] = useState(false);

  const handleRepair = async () => {
    setRepairing(true);
    setRepairStatus('Reparatur wird gestartet...');
    setRepairFailed(false);

    const errorContext = JSON.stringify({
      type: 'data_loading',
      message: error.message,
      stack: (error.stack ?? '').split('\n').slice(0, 10).join('\n'),
      url: window.location.href,
    });

    try {
      const resp = await fetch(REPAIR_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ appgroup_id: APPGROUP_ID, error_context: errorContext }),
      });

      if (!resp.ok || !resp.body) {
        setRepairing(false);
        setRepairFailed(true);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const raw of lines) {
          const line = raw.trim();
          if (!line.startsWith('data: ')) continue;
          const content = line.slice(6);
          if (content.startsWith('[STATUS]')) {
            setRepairStatus(content.replace(/^\[STATUS]\s*/, ''));
          }
          if (content.startsWith('[DONE]')) {
            setRepairDone(true);
            setRepairing(false);
          }
          if (content.startsWith('[ERROR]') && !content.includes('Dashboard-Links')) {
            setRepairFailed(true);
          }
        }
      }
    } catch {
      setRepairing(false);
      setRepairFailed(true);
    }
  };

  if (repairDone) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center">
          <IconCheck size={22} className="text-green-500" />
        </div>
        <div className="text-center">
          <h3 className="font-semibold text-foreground mb-1">Dashboard repariert</h3>
          <p className="text-sm text-muted-foreground max-w-xs">Das Problem wurde behoben. Bitte laden Sie die Seite neu.</p>
        </div>
        <Button size="sm" onClick={() => window.location.reload()}>
          <IconRefresh size={14} className="mr-1" />Neu laden
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center">
        <IconAlertCircle size={22} className="text-destructive" />
      </div>
      <div className="text-center">
        <h3 className="font-semibold text-foreground mb-1">Fehler beim Laden</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          {repairing ? repairStatus : error.message}
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onRetry} disabled={repairing}>Erneut versuchen</Button>
        <Button size="sm" onClick={handleRepair} disabled={repairing}>
          {repairing
            ? <span className="inline-block w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-1" />
            : <IconTool size={14} className="mr-1" />}
          {repairing ? 'Reparatur läuft...' : 'Dashboard reparieren'}
        </Button>
      </div>
      {repairFailed && <p className="text-sm text-destructive">Automatische Reparatur fehlgeschlagen. Bitte kontaktieren Sie den Support.</p>}
    </div>
  );
}
