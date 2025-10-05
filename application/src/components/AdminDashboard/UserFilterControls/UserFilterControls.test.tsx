import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import UserFilterControls from './UserFilterControls';
import { SubscriptionPlanEnum, SubscriptionStatusEnum } from '../../../types';

describe('UserFilterControls', () => {
  const setSearchName = jest.fn();
  const setFilterPlan = jest.fn();
  const setFilterStatus = jest.fn();
  const setPage = jest.fn();

  it('renders all filter fields', () => {
    render(
      <UserFilterControls
        searchName="test"
        setSearchName={setSearchName}
        filterPlan=""
        setFilterPlan={setFilterPlan}
        filterStatus=""
        setFilterStatus={setFilterStatus}
        setPage={setPage}
      />
    );
    expect(screen.getByLabelText(/Search by name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Filter by plan/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Filter by status/i)).toBeInTheDocument();
  });

  it('calls setSearchName and setPage on search input change', () => {
    render(
      <UserFilterControls
        searchName=""
        setSearchName={setSearchName}
        filterPlan=""
        setFilterPlan={setFilterPlan}
        filterStatus=""
        setFilterStatus={setFilterStatus}
        setPage={setPage}
      />
    );
    const searchInput = screen.getByLabelText(/Search by name/i);
    fireEvent.change(searchInput, { target: { value: 'Alice' } });
    expect(setSearchName).toHaveBeenCalledWith('Alice');
    expect(setPage).toHaveBeenCalledWith(1);
  });

  it('calls setFilterPlan and setPage on plan change', () => {
    render(
      <UserFilterControls
        searchName=""
        setSearchName={setSearchName}
        filterPlan=""
        setFilterPlan={setFilterPlan}
        filterStatus=""
        setFilterStatus={setFilterStatus}
        setPage={setPage}
      />
    );
    const planSelect = screen.getByTestId('plan-select');
    fireEvent.change(planSelect, { target: { value: SubscriptionPlanEnum.PRO } });
    expect(setFilterPlan).toHaveBeenCalledWith(SubscriptionPlanEnum.PRO);
    expect(setPage).toHaveBeenCalledWith(1);
  });

  it('calls setFilterStatus and setPage on status change', () => {
    render(
      <UserFilterControls
        searchName=""
        setSearchName={setSearchName}
        filterPlan=""
        setFilterPlan={setFilterPlan}
        filterStatus=""
        setFilterStatus={setFilterStatus}
        setPage={setPage}
      />
    );
    const statusSelect = screen.getByTestId('status-select');
    fireEvent.change(statusSelect, { target: { value: SubscriptionStatusEnum.ACTIVE } });
    expect(setFilterStatus).toHaveBeenCalledWith(SubscriptionStatusEnum.ACTIVE);
    expect(setPage).toHaveBeenCalledWith(1);
  });
});
