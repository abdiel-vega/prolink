"use client";

import { useState } from "react";
import { FileText, Calendar, AlertCircle, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { ServiceWithProfile } from "@/types";

interface ProjectRequirementsFormProps {
  service: ServiceWithProfile;
  requirements: string;
  specialRequests: string;
  onRequirementsChange: (requirements: string) => void;
  onSpecialRequestsChange: (requests: string) => void;
  className?: string;
}

export function ProjectRequirementsForm({
  service,
  requirements,
  specialRequests,
  onRequirementsChange,
  onSpecialRequestsChange,
  className = ""
}: ProjectRequirementsFormProps) {
  const [showDeliveryDetails, setShowDeliveryDetails] = useState(false);

  const calculateDeliveryDate = () => {
    const now = new Date();
    const deliveryDate = new Date(now);
    
    switch (service.delivery_time_unit) {
      case 'MINUTES':
        deliveryDate.setMinutes(now.getMinutes() + service.delivery_time_value);
        break;
      case 'HOURS':
        deliveryDate.setHours(now.getHours() + service.delivery_time_value);
        break;
      case 'DAYS':
        deliveryDate.setDate(now.getDate() + service.delivery_time_value);
        break;
      case 'WEEKS':
        deliveryDate.setDate(now.getDate() + (service.delivery_time_value * 7));
        break;
      case 'MONTHS':
        deliveryDate.setMonth(now.getMonth() + service.delivery_time_value);
        break;
    }
    
    return deliveryDate;
  };

  const formatDeliveryTime = (value: number, unit: string) => {
    const unitMap = {
      MINUTES: value === 1 ? 'minute' : 'minutes',
      HOURS: value === 1 ? 'hour' : 'hours',
      DAYS: value === 1 ? 'day' : 'days',
      WEEKS: value === 1 ? 'week' : 'weeks',
      MONTHS: value === 1 ? 'month' : 'months',
    };
    
    return `${value} ${unitMap[unit as keyof typeof unitMap] || unit.toLowerCase()}`;
  };

  const formatDeliveryDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const deliveryDate = calculateDeliveryDate();
  const isBusinessDay = deliveryDate.getDay() !== 0 && deliveryDate.getDay() !== 6;

  const requirementsWordCount = requirements.trim().split(/\s+/).filter(word => word.length > 0).length;
  const specialRequestsWordCount = specialRequests.trim().split(/\s+/).filter(word => word.length > 0).length;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Project Requirements */}
      <Card className="card-secondary">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Project Requirements
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Describe your project in detail to help the professional understand your needs.
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="requirements" className="text-sm font-medium">
              Project Description *
            </Label>
            <Textarea
              id="requirements"
              placeholder="Please describe your project, including:
• What you need delivered
• Your goals and objectives
• Any specific requirements or constraints
• Timeline expectations
• Budget considerations
• Examples or references if applicable"
              value={requirements}
              onChange={(e) => onRequirementsChange(e.target.value)}
              className="min-h-[200px] mt-2"
              required
            />
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-muted-foreground">
                {requirementsWordCount} words • Minimum 50 words recommended
              </p>
              {requirementsWordCount >= 50 ? (
                <Badge className="status-success text-xs">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Good detail
                </Badge>
              ) : requirementsWordCount >= 20 ? (
                <Badge className="status-warning text-xs">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  More detail needed
                </Badge>
              ) : (
                <Badge className="status-neutral text-xs">
                  Too brief
                </Badge>
              )}
            </div>
          </div>

          {/* Project Guidelines */}
          <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              💡 Writing Great Requirements
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Be specific about deliverables and expectations</li>
              <li>• Include any technical requirements or preferences</li>
              <li>• Mention your target audience or use case</li>
              <li>• Share examples or references if you have them</li>
              <li>• Ask questions if you're unsure about anything</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Special Requests */}
      <Card className="card-secondary">
        <CardHeader>
          <CardTitle className="text-lg">Additional Requests</CardTitle>
          <p className="text-sm text-muted-foreground">
            Any special instructions, preferences, or additional services needed.
          </p>
        </CardHeader>
        
        <CardContent>
          <div>
            <Label htmlFor="special-requests" className="text-sm font-medium">
              Special Requests (Optional)
            </Label>
            <Textarea
              id="special-requests"
              placeholder="Examples:
• Rush delivery needed
• Specific communication preferences
• File format requirements
• Revision expectations
• Meeting or call requests"
              value={specialRequests}
              onChange={(e) => onSpecialRequestsChange(e.target.value)}
              className="min-h-[120px] mt-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {specialRequestsWordCount} words
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Timeline */}
      <Card className="card-secondary">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Estimated Delivery
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDeliveryDetails(!showDeliveryDetails)}
            >
              {showDeliveryDetails ? 'Hide' : 'Show'} Details
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
              <div>
                <p className="font-medium text-green-900 dark:text-green-100">
                  Expected Delivery Date
                </p>
                <p className="text-sm text-green-800 dark:text-green-200">
                  {formatDeliveryDate(deliveryDate)}
                </p>
              </div>
              <Badge className="status-success">
                {formatDeliveryTime(service.delivery_time_value, service.delivery_time_unit)}
              </Badge>
            </div>

            {showDeliveryDetails && (
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>Delivery timeframe:</span>
                  <span className="font-medium text-foreground">
                    {formatDeliveryTime(service.delivery_time_value, service.delivery_time_unit)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Business days only:</span>
                  <span className="font-medium text-foreground">
                    {isBusinessDay ? 'Yes' : 'No'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Rush delivery available:</span>
                  <span className="font-medium text-foreground">Contact professional</span>
                </div>
                
                <div className="bg-yellow-50 dark:bg-yellow-950/20 p-3 rounded border border-yellow-200 dark:border-yellow-800">
                  <p className="text-xs text-yellow-800 dark:text-yellow-200">
                    <AlertCircle className="w-4 h-4 inline mr-1" />
                    Delivery date may vary based on project complexity and requirements. 
                    The professional will confirm the timeline after reviewing your requirements.
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
