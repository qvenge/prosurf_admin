import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { Header, SideModal, Pagination, SegmentedButtons, Button, Icon, type SortCriterion } from '@/shared/ui';
import { PlusBold } from '@/shared/ds/icons';
import {
  useSeasonTicketsAdmin,
  useSeasonTicketPlan,
  useClient,
  type SeasonTicketAdminFilters,
  type SeasonTicketStatus,
  type SeasonTicketPlan,
  type SeasonTicketAdmin,
} from '@/shared/api';
import { SeasonTicketsTable } from './components/SeasonTicketsTable';
import { SeasonTicketsFilters } from './components/SeasonTicketsFilters';
import { PlansTab } from './components/PlansTab';
import { PlanForm } from './components/PlanForm';
import { DeletePlanModal } from './components/DeletePlanModal';
import { CancelTicketModal } from './components/CancelTicketModal';
import styles from './SeasonTicketsPage.module.scss';

const tabOptions = [
  { value: 'tickets', label: 'Абонементы' },
  { value: 'plans', label: 'Планы' },
];

function serializeSort(sort: SortCriterion[]): string {
  return sort.map((s) => `${s.field}:${s.order}`).join(',');
}

function parseSort(param: string | null): SortCriterion[] {
  if (!param) return [];
  return param.split(',').map((item) => {
    const [field, order] = item.split(':');
    return { field, order: order as 'asc' | 'desc' };
  });
}

export function SeasonTicketsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedTab, setSelectedTab] = useState(tabOptions[0].value);

  // Plans tab state
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SeasonTicketPlan | undefined>(undefined);
  const [deletingPlan, setDeletingPlan] = useState<SeasonTicketPlan | undefined>(undefined);

  // Cancel ticket state
  const [cancellingTicket, setCancellingTicket] = useState<SeasonTicketAdmin | undefined>(undefined);

  const planId = searchParams.get('planId');
  const clientId = searchParams.get('clientId');

  const sort = useMemo(() => parseSort(searchParams.get('sort')), [searchParams]);

  // Получить название плана для badge (только если planId есть)
  const { data: plan } = useSeasonTicketPlan(planId || '');

  // Получить имя клиента для badge (только если clientId есть)
  const { data: clientData } = useClient(clientId || '');

  const filters = useMemo(
    () => ({
      page: Number(searchParams.get('page')) || 1,
      limit: Number(searchParams.get('limit')) || 20,
      sort: sort as SeasonTicketAdminFilters['sort'],
      ownerSearch: searchParams.get('ownerSearch') || undefined,
      planId: planId || undefined,
      clientId: clientId || undefined,
      status: searchParams.get('status')
        ? [searchParams.get('status') as SeasonTicketStatus]
        : undefined,
      hasRemainingPasses: searchParams.get('hasRemainingPasses')
        ? searchParams.get('hasRemainingPasses') === 'true'
        : undefined,
    }),
    [searchParams, sort, planId, clientId]
  );

  const { data, isLoading } = useSeasonTicketsAdmin(filters);

  const handleFilterChange = useCallback(
    (newFilters: Partial<SeasonTicketAdminFilters>) => {
      const params = new URLSearchParams(searchParams);
      params.set('page', '1');

      Object.entries(newFilters).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') {
          params.delete(key);
        } else if (key === 'sort' && Array.isArray(value)) {
          if (value.length > 0) {
            params.set('sort', serializeSort(value as SortCriterion[]));
          } else {
            params.delete('sort');
          }
        } else if (key === 'status' && Array.isArray(value)) {
          if (value.length > 0) {
            params.set('status', value[0] as string);
          } else {
            params.delete('status');
          }
        } else if (typeof value === 'boolean') {
          params.set(key, String(value));
        } else {
          params.set(key, String(value));
        }
      });

      setSearchParams(params);
    },
    [searchParams, setSearchParams]
  );

  const handleSortChange = useCallback(
    (sort: SortCriterion[]) => {
      const params = new URLSearchParams(searchParams);
      params.set('page', '1');
      if (sort.length > 0) {
        params.set('sort', serializeSort(sort));
      } else {
        params.delete('sort');
      }
      setSearchParams(params);
    },
    [searchParams, setSearchParams]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams);
      params.set('page', String(page));
      setSearchParams(params);
    },
    [searchParams, setSearchParams]
  );

  const handleCancelTicket = useCallback((ticket: SeasonTicketAdmin) => {
    setCancellingTicket(ticket);
  }, []);

  const handleCloseCancelModal = useCallback(() => {
    setCancellingTicket(undefined);
  }, []);

  const handlePlanClick = useCallback(
    (planId: string) => {
      const params = new URLSearchParams(searchParams);
      params.set('planId', planId);
      params.set('page', '1');
      params.delete('ticketId');
      setSearchParams(params);
    },
    [searchParams, setSearchParams]
  );

  const handleClearPlan = useCallback(() => {
    const params = new URLSearchParams(searchParams);
    params.delete('planId');
    params.set('page', '1');
    setSearchParams(params);
  }, [searchParams, setSearchParams]);

  const handleClearClient = useCallback(() => {
    const params = new URLSearchParams(searchParams);
    params.delete('clientId');
    params.set('page', '1');
    setSearchParams(params);
  }, [searchParams, setSearchParams]);

  // Plans tab handlers
  const handleCreatePlan = useCallback(() => {
    setEditingPlan(undefined);
    setIsPlanModalOpen(true);
  }, []);

  const handleEditPlan = useCallback((plan: SeasonTicketPlan) => {
    setEditingPlan(plan);
    setIsPlanModalOpen(true);
  }, []);

  const handleDeletePlan = useCallback((plan: SeasonTicketPlan) => {
    setDeletingPlan(plan);
  }, []);

  const handleClosePlanModal = useCallback(() => {
    setIsPlanModalOpen(false);
    setEditingPlan(undefined);
  }, []);

  const handleCloseDeletePlanModal = useCallback(() => {
    setDeletingPlan(undefined);
  }, []);

  return (
    <>
      <Header title="Абонементы">
        <SegmentedButtons
          className={styles.tabs}
          options={tabOptions}
          value={selectedTab}
          onChange={(value) => {
            setSelectedTab(value);
          }}
        />
        {selectedTab === 'plans' && (
          <Button type="primary" size="l" onClick={handleCreatePlan}>
            <Icon src={PlusBold} width={20} height={20} className={styles.addIcon} />
            Добавить
          </Button>
        )}
      </Header>
      <div className={styles.page}>
        {selectedTab === 'tickets' && (
          <>
            <SeasonTicketsFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              planName={plan?.name}
              onClearPlan={planId ? handleClearPlan : undefined}
              clientName={clientData ? [clientData.lastName, clientData.firstName].filter(Boolean).join(' ') || clientData.username || 'Клиент' : undefined}
              onClearClient={clientId ? handleClearClient : undefined}
            />

            <SeasonTicketsTable
              data={data?.items || []}
              isLoading={isLoading}
              sort={sort}
              onSortChange={handleSortChange}
              onCancel={handleCancelTicket}
              onPlanClick={handlePlanClick}
            />

            {data && (
              <Pagination
                page={data.page}
                totalPages={data.totalPages}
                total={data.total}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}
        {selectedTab === 'plans' && (
          <PlansTab onEdit={handleEditPlan} onDelete={handleDeletePlan} />
        )}
      </div>

      {cancellingTicket && (
        <CancelTicketModal ticket={cancellingTicket} onClose={handleCloseCancelModal} />
      )}

      {isPlanModalOpen && (
        <SideModal onClose={handleClosePlanModal}>
          <PlanForm onClose={handleClosePlanModal} planData={editingPlan} />
        </SideModal>
      )}

      {deletingPlan && (
        <DeletePlanModal plan={deletingPlan} onClose={handleCloseDeletePlanModal} />
      )}
    </>
  );
}
